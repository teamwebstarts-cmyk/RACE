import { Types } from 'mongoose';

import { BookingModel } from '../../bookings/booking.model';
import { UserModel } from '../../users/user.model';
import { VehicleModel } from '../../vehicles/vehicle.model';
import { escapeRegex, paginate } from '../shared/pagination';
import { logActivity } from '../shared/activity-logger';
import { NotFoundError } from '../../../shared/utils/errors';

function mapAdminBookingStatus(status: string) {
  if (['SERVICE_COMPLETED', 'PAID'].includes(status)) return 'COMPLETED';
  if (status === 'CANCELLED') return 'CANCELLED';
  return status;
}

async function mapBookingListItem(booking: {
  _id: Types.ObjectId;
  bookingNumber: string;
  serviceLabel: string;
  status: string;
  invoice?: { total: number };
  createdAt: Date;
  customerId: Types.ObjectId;
  driver?: { name: string };
}) {
  const customer = await UserModel.findById(booking.customerId).lean();
  return {
    id: booking._id.toString(),
    bookingNumber: booking.bookingNumber,
    customerName: customer?.fullName ?? 'Customer',
    vendorName: '—',
    driverName: booking.driver?.name,
    service: booking.serviceLabel,
    serviceType: 'towing',
    amount: booking.invoice?.total ?? 0,
    city: customer?.address?.city ?? '—',
    status: mapAdminBookingStatus(booking.status),
    date: booking.createdAt.toISOString(),
  };
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
      if (filters.status === 'COMPLETED') {
        query.status = { $in: ['SERVICE_COMPLETED', 'PAID'] };
      } else {
        query.status = filters.status;
      }
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
    const [all, created, assigned, enRoute, completed, cancelled] = await Promise.all([
      BookingModel.countDocuments(),
      BookingModel.countDocuments({ status: 'CREATED' }),
      BookingModel.countDocuments({ status: { $in: ['ASSIGNED', 'ACCEPTED'] } }),
      BookingModel.countDocuments({ status: 'EN_ROUTE' }),
      BookingModel.countDocuments({ status: { $in: ['SERVICE_COMPLETED', 'PAID'] } }),
      BookingModel.countDocuments({ status: 'CANCELLED' }),
    ]);
    return { all, created, assigned, enRoute, completed, cancelled };
  },

  async getById(id: string) {
    const booking = await BookingModel.findById(id);
    if (!booking) throw new NotFoundError('Booking not found');
    const customer = await UserModel.findById(booking.customerId).lean();
    return {
      id: booking._id.toString(),
      bookingNumber: booking.bookingNumber,
      customerName: customer?.fullName ?? 'Customer',
      customerPhone: customer?.mobileNumber,
      vendorName: '—',
      driverName: booking.driver?.name,
      service: booking.serviceLabel,
      serviceType: booking.categoryId,
      amount: booking.invoice?.total ?? 0,
      city: customer?.address?.city ?? booking.pickup.label,
      status: mapAdminBookingStatus(booking.status),
      date: booking.createdAt.toISOString(),
      pickup: booking.pickup,
      dropoff: booking.dropoff,
      timeline: booking.statusHistory.map((s) => ({
        status: s.status,
        timestamp: s.timestamp.toISOString(),
      })),
      invoice: booking.invoice,
      rating: booking.rating,
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

    return mapBookingListItem(booking);
  },

  async update(id: string, input: Record<string, string | number>, actor: { id: string; name: string }) {
    const booking = await BookingModel.findById(id);
    if (!booking) throw new NotFoundError('Booking not found');

    if (input.status) {
      booking.status = String(input.status) as never;
      booking.statusHistory.push({ status: booking.status, timestamp: new Date() });
    }
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
