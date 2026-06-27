import { Types } from 'mongoose';

import { BookingModel } from '../../bookings/booking.model';
import { UserModel } from '../../users/user.model';
import { VehicleModel } from '../../vehicles/vehicle.model';
import { VendorModel } from '../../vendors/vendor.model';
import { DriverModel } from '../models/driver.model';
import { TransactionModel } from '../models/transaction.model';
import { escapeRegex, paginate } from '../shared/pagination';
import { logActivity } from '../shared/activity-logger';
import { createNotification } from '../shared/notification-service';
import { mapLocationPoint } from '../shared/response-mappers';
import { generateBookingFinancials, generateRefund } from '../shared/transaction-engine';
import { NotFoundError } from '../../../shared/utils/errors';

const COMPLETED_STATUSES = ['SERVICE_COMPLETED', 'PAID'];
const ACTIVE_STATUSES = ['CREATED', 'ASSIGNED', 'ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'SERVICE_STARTED', 'PAYMENT_PENDING'];

function mapAdminBookingStatus(status: string) {
  if (COMPLETED_STATUSES.includes(status)) return 'COMPLETED';
  if (status === 'CANCELLED') return 'CANCELLED';
  if (status === 'REFUNDED') return 'REFUNDED';
  return status;
}

async function mapBookingListItem(booking: {
  _id: Types.ObjectId;
  bookingNumber: string;
  serviceLabel: string;
  categoryId: string;
  status: string;
  invoice?: { total: number };
  createdAt: Date;
  customerId: Types.ObjectId;
  vendorId?: Types.ObjectId;
  driver?: { name: string };
}) {
  const [customer, vendor] = await Promise.all([
    UserModel.findById(booking.customerId).lean(),
    booking.vendorId ? VendorModel.findById(booking.vendorId).lean() : null,
  ]);

  return {
    id: booking._id.toString(),
    bookingNumber: booking.bookingNumber,
    customerName: customer?.fullName ?? 'Customer',
    vendorName: vendor?.businessName ?? vendor?.ownerName ?? '—',
    driverName: booking.driver?.name,
    service: booking.serviceLabel,
    serviceType: booking.categoryId,
    amount: booking.invoice?.total ?? 0,
    city: customer?.address?.city ?? '—',
    status: mapAdminBookingStatus(booking.status),
    date: booking.createdAt.toISOString(),
  };
}

async function pushStatus(
  booking: { status: string; statusHistory: { status: string; timestamp: Date }[] },
  status: string,
) {
  booking.status = status;
  booking.statusHistory.push({ status, timestamp: new Date() });
}

export const adminBookingsService = {
  async list(filters: {
    search?: string;
    status?: string;
    serviceType?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    pageSize?: number;
  }) {
    const query: Record<string, unknown> = {};
    if (filters.status && filters.status !== 'ALL') {
      if (filters.status === 'COMPLETED') query.status = { $in: COMPLETED_STATUSES };
      else if (filters.status === 'ACTIVE') query.status = { $in: ACTIVE_STATUSES };
      else query.status = filters.status;
    }
    if (filters.serviceType && filters.serviceType !== 'ALL') {
      query.categoryId = filters.serviceType;
    }
    if (filters.dateFrom || filters.dateTo) {
      query.createdAt = {};
      if (filters.dateFrom) (query.createdAt as Record<string, Date>).$gte = new Date(filters.dateFrom);
      if (filters.dateTo) {
        const end = new Date(filters.dateTo);
        end.setHours(23, 59, 59, 999);
        (query.createdAt as Record<string, Date>).$lte = end;
      }
    }
    if (filters.search?.trim()) {
      const regex = new RegExp(escapeRegex(filters.search.trim()), 'i');
      query.$or = [{ bookingNumber: regex }, { serviceLabel: regex }];
    }

    const result = await paginate(BookingModel, query, filters, (doc) => doc as never);
    return {
      ...result,
      items: await Promise.all(result.items.map((b) => mapBookingListItem(b))),
    };
  },

  async getCounts() {
    const [all, created, assigned, enRoute, completed, cancelled, refunded] = await Promise.all([
      BookingModel.countDocuments(),
      BookingModel.countDocuments({ status: 'CREATED' }),
      BookingModel.countDocuments({ status: { $in: ['ASSIGNED', 'ACCEPTED'] } }),
      BookingModel.countDocuments({ status: { $in: ['EN_ROUTE', 'ARRIVED'] } }),
      BookingModel.countDocuments({ status: { $in: COMPLETED_STATUSES } }),
      BookingModel.countDocuments({ status: 'CANCELLED' }),
      BookingModel.countDocuments({ status: 'REFUNDED' }),
    ]);
    return { all, created, assigned, enRoute, completed, cancelled, refunded };
  },

  async getById(id: string) {
    const booking = await BookingModel.findById(id);
    if (!booking) throw new NotFoundError('Booking not found');

    let vendorId = booking.vendorId;
    if (!vendorId && booking.driver?.id) {
      const driver = await DriverModel.findById(booking.driver.id).lean();
      vendorId = driver?.vendorId;
    }

    const [customer, vendor, payments] = await Promise.all([
      UserModel.findById(booking.customerId).lean(),
      vendorId ? VendorModel.findById(vendorId).lean() : null,
      TransactionModel.find({ bookingId: booking._id }).sort({ createdAt: -1 }).lean(),
    ]);

    const paymentTx = payments.find((p) => p.type === 'PAYMENT') ?? payments[0];

    return {
      id: booking._id.toString(),
      bookingNumber: booking.bookingNumber,
      customerId: booking.customerId.toString(),
      customerName: customer?.fullName ?? 'Customer',
      customerPhone: customer?.mobileNumber ?? '—',
      customerEmail: customer?.email ?? '',
      vendorId: vendorId?.toString() ?? '',
      vendorName: vendor?.businessName ?? vendor?.ownerName ?? '—',
      vendorPhone: vendor?.mobileNumber ?? '—',
      driverId: booking.driver?.id,
      driverName: booking.driver?.name,
      driverPhone: booking.driver?.phone,
      service: booking.serviceLabel,
      serviceType: booking.categoryId,
      amount: booking.invoice?.total ?? 0,
      city: customer?.address?.city ?? booking.pickup.label,
      status: mapAdminBookingStatus(booking.status),
      date: booking.createdAt.toISOString(),
      location: {
        pickup: mapLocationPoint(booking.pickup),
        dropoff: booking.dropoff ? mapLocationPoint(booking.dropoff) : undefined,
      },
      payment: {
        amount: booking.invoice?.total ?? paymentTx?.amount ?? 0,
        method: booking.invoice?.paymentMethod ?? paymentTx?.paymentMethod ?? 'UPI',
        status: paymentTx?.status ?? (booking.status === 'PAID' ? 'COMPLETED' : 'PENDING'),
        transactionId: paymentTx?.transactionCode ?? paymentTx?._id?.toString() ?? '—',
        paidAt: paymentTx?.completedAt?.toISOString(),
      },
      timeline: booking.statusHistory.map((s, index) => ({
        id: `${booking._id.toString()}-${index}`,
        title: s.status.replace(/_/g, ' '),
        timestamp: s.timestamp.toISOString(),
        status: mapAdminBookingStatus(s.status),
      })),
      notes: booking.cancelReason,
    };
  },

  async create(input: Record<string, string | number>, actor: { id: string; name: string }) {
    const count = await BookingModel.countDocuments();
    const customer = await UserModel.findOne({ fullName: input.customerName as string, role: 'customer' });
    if (!customer) throw new NotFoundError('Customer not found');

    let vehicle = await VehicleModel.findOne({ customerId: customer._id });
    if (!vehicle) {
      vehicle = await VehicleModel.create({
        customerId: customer._id,
        vehicleNumber: `OD-TEMP-${count + 1}`,
        vehicleType: 'car',
        brand: 'Generic',
        vehicleModel: 'Vehicle',
        color: 'White',
        fuelType: 'petrol',
        qrCode: `QR-${customer._id.toString().slice(-8)}-${count + 1}`,
      });
    }

    const booking = await BookingModel.create({
      customerId: customer._id,
      vendorId: input.vendorId ? new Types.ObjectId(String(input.vendorId)) : undefined,
      bookingNumber: `BK${String(count + 1000)}${String.fromCharCode(65 + (count % 26))}`,
      categoryId: String(input.serviceType ?? 'towing'),
      serviceId: String(input.serviceType ?? 'towing'),
      serviceLabel: String(input.service ?? 'Towing Service'),
      status: String(input.status ?? 'CREATED'),
      vehicleId: vehicle._id,
      vehicleNumber: vehicle.vehicleNumber,
      pickup: { label: String(input.city ?? 'Pickup'), address: String(input.city ?? 'Pickup') },
      invoice: { baseFare: Number(input.amount ?? 0), total: Number(input.amount ?? 0), currency: 'INR' },
      statusHistory: [{ status: 'CREATED', timestamp: new Date() }],
    });

    await logActivity({
      actorId: actor.id,
      actorName: actor.name,
      action: 'BOOKING_CREATED',
      entityType: 'booking',
      entityId: booking._id.toString(),
      title: `Booking ${booking.bookingNumber} created`,
    });

    await createNotification({
      title: 'New booking created',
      message: `Booking ${booking.bookingNumber} created by admin`,
      category: 'booking',
      entityType: 'booking',
      entityId: booking._id.toString(),
    });

    return mapBookingListItem(booking);
  },

  async assignVendor(id: string, vendorId: string, actor: { id: string; name: string }) {
    const [booking, vendor] = await Promise.all([
      BookingModel.findById(id),
      VendorModel.findById(vendorId),
    ]);
    if (!booking) throw new NotFoundError('Booking not found');
    if (!vendor) throw new NotFoundError('Vendor not found');

    booking.vendorId = vendor._id;
    await pushStatus(booking, 'ASSIGNED');
    await booking.save();

    await logActivity({
      actorId: actor.id,
      actorName: actor.name,
      action: 'BOOKING_VENDOR_ASSIGNED',
      entityType: 'booking',
      entityId: id,
      title: `Vendor assigned to ${booking.bookingNumber}`,
    });

    await createNotification({
      title: 'Booking assigned to vendor',
      message: `${booking.bookingNumber} assigned to ${vendor.businessName ?? vendor.ownerName}`,
      category: 'booking',
      entityType: 'booking',
      entityId: id,
    });

    return mapBookingListItem(booking);
  },

  async assignDriver(id: string, driverId: string, actor: { id: string; name: string }) {
    const [booking, driver] = await Promise.all([
      BookingModel.findById(id),
      DriverModel.findById(driverId),
    ]);
    if (!booking) throw new NotFoundError('Booking not found');
    if (!driver) throw new NotFoundError('Driver not found');

    booking.driver = {
      id: driver._id.toString(),
      name: driver.name,
      rating: driver.rating,
      phone: driver.phone,
    };
    if (driver.vendorId) booking.vendorId = driver.vendorId;
    await pushStatus(booking, 'ASSIGNED');
    await booking.save();

    await logActivity({
      actorId: actor.id,
      actorName: actor.name,
      action: 'BOOKING_DRIVER_ASSIGNED',
      entityType: 'booking',
      entityId: id,
      title: `Driver ${driver.name} assigned to ${booking.bookingNumber}`,
    });

    return mapBookingListItem(booking);
  },

  async updateStatus(
    id: string,
    status: string,
    actor: { id: string; name: string },
    options?: { reason?: string; amount?: number },
  ) {
    const booking = await BookingModel.findById(id);
    if (!booking) throw new NotFoundError('Booking not found');

    await pushStatus(booking, status);

    if (options?.amount !== undefined) {
      booking.invoice = {
        baseFare: options.amount,
        total: options.amount,
        currency: booking.invoice?.currency ?? 'INR',
        platformFee: booking.invoice?.platformFee,
      };
    }

    if (status === 'CANCELLED') {
      booking.cancelReason = options?.reason;
      await createNotification({
        title: 'Booking cancelled',
        message: `${booking.bookingNumber} was cancelled`,
        type: 'warning',
        category: 'booking',
        entityType: 'booking',
        entityId: id,
      });
    } else if (['SERVICE_COMPLETED', 'PAID', 'COMPLETED'].includes(status)) {
      booking.status = 'PAID';
      booking.statusHistory.push({ status: 'PAID', timestamp: new Date() });
      await generateBookingFinancials(booking._id);
      await createNotification({
        title: 'Booking completed',
        message: `${booking.bookingNumber} marked completed`,
        type: 'success',
        category: 'booking',
        entityType: 'booking',
        entityId: id,
      });
    } else if (status === 'REFUNDED') {
      booking.refundedAt = new Date();
      await generateRefund(booking._id, options?.amount);
      await createNotification({
        title: 'Refund processed',
        message: `Refund processed for ${booking.bookingNumber}`,
        type: 'info',
        category: 'payment',
        entityType: 'booking',
        entityId: id,
      });
    }

    await booking.save();

    await logActivity({
      actorId: actor.id,
      actorName: actor.name,
      action: `BOOKING_${status}`,
      entityType: 'booking',
      entityId: id,
      title: `Booking ${booking.bookingNumber} status → ${status}`,
      description: options?.reason,
    });

    return mapBookingListItem(booking);
  },

  async update(id: string, input: Record<string, string | number>, actor: { id: string; name: string }) {
    if (input.status) {
      return this.updateStatus(id, String(input.status), actor, {
        reason: input.reason as string | undefined,
        amount: input.amount !== undefined ? Number(input.amount) : undefined,
      });
    }

    const booking = await BookingModel.findById(id);
    if (!booking) throw new NotFoundError('Booking not found');

    if (input.amount) {
      booking.invoice = {
        baseFare: Number(input.amount),
        total: Number(input.amount),
        currency: 'INR',
      };
    }
    await booking.save();

    await logActivity({
      actorId: actor.id,
      actorName: actor.name,
      action: 'BOOKING_UPDATED',
      entityType: 'booking',
      entityId: booking._id.toString(),
      title: `Booking ${booking.bookingNumber} updated`,
    });

    return mapBookingListItem(booking);
  },

  async remove(id: string, actor: { id: string; name: string }) {
    const booking = await BookingModel.findByIdAndDelete(id);
    if (!booking) throw new NotFoundError('Booking not found');
    await logActivity({
      actorId: actor.id,
      actorName: actor.name,
      action: 'BOOKING_DELETED',
      entityType: 'booking',
      entityId: id,
      title: `Booking ${booking.bookingNumber} deleted`,
    });
  },
};
