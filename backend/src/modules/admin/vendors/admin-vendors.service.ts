import { Types } from 'mongoose';

import { VendorModel } from '../../vendors/vendor.model';
import { UserModel } from '../../users/user.model';
import { DriverModel } from '../models/driver.model';
import { BookingModel } from '../../bookings/booking.model';
import { TransactionModel } from '../models/transaction.model';
import { VendorVehicleModel } from '../models/vendor-vehicle.model';
import { escapeRegex, paginate } from '../shared/pagination';
import { logActivity } from '../shared/activity-logger';
import { createNotification } from '../shared/notification-service';
import { getEntityActivities } from '../shared/entity-activities';
import {
  driverInitials,
  formatInr,
  mapVendorTypeLabel,
} from '../shared/response-mappers';
import { NotFoundError } from '../../../shared/utils/errors';

function mapAssignedDriverStatus(status: string): 'ACTIVE' | 'ON_LEAVE' {
  if (status === 'SUSPENDED') return 'ON_LEAVE';
  return 'ACTIVE';
}

function mapVendorStatus(status: string): string {
  if (status === 'approved') return 'APPROVED';
  if (status === 'rejected') return 'REJECTED';
  if (status === 'suspended') return 'SUSPENDED';
  return 'PENDING';
}

function mapVendor(vendor: {
  _id: { toString(): string };
  businessName?: string;
  ownerName?: string;
  mobileNumber: string;
  email?: string;
  address?: string;
  status: string;
  verificationStage: string;
  vendorType: string;
}) {
  const city = vendor.address?.split(',')[0] ?? 'Odisha';
  const status = mapVendorStatus(vendor.status);
  return {
    id: vendor._id.toString(),
    businessName: vendor.businessName ?? vendor.ownerName ?? 'Vendor',
    ownerName: vendor.ownerName ?? '—',
    phone: vendor.mobileNumber,
    email: vendor.email ?? '',
    location: vendor.address ?? city,
    city,
    vehicleCount: 0,
    driverCount: 0,
    rating: 0,
    reviewCount: 0,
    status,
    verificationStatus: vendor.verificationStage === 'approved' ? 'VERIFIED' : 'PENDING',
    documentsStatus: status === 'APPROVED' ? 'VERIFIED' : 'PENDING',
  };
}

export const adminVendorsService = {
  async list(filters: Record<string, string | number | undefined>) {
    const query: Record<string, unknown> = {};
    if (filters.status && filters.status !== 'ALL') {
      const statusMap: Record<string, string> = {
        APPROVED: 'approved',
        PENDING: 'pending',
        REJECTED: 'rejected',
        SUSPENDED: 'changes_requested',
      };
      query.status = statusMap[String(filters.status)] ?? String(filters.status).toLowerCase();
    }
    if (filters.search) {
      const regex = new RegExp(escapeRegex(String(filters.search)), 'i');
      query.$or = [{ businessName: regex }, { ownerName: regex }, { mobileNumber: regex }, { email: regex }];
    }

    const result = await paginate(VendorModel, query, filters as never, (doc) => mapVendor(doc as never));

    const vendorIds = result.items.map((v) => new Types.ObjectId(v.id));
    const [driverCounts, vehicleCounts, revenueAgg] = await Promise.all([
      DriverModel.aggregate([
        { $match: { vendorId: { $in: vendorIds } } },
        { $group: { _id: '$vendorId', count: { $sum: 1 } } },
      ]),
      VendorVehicleModel.aggregate([
        { $match: { vendorId: { $in: vendorIds } } },
        { $group: { _id: '$vendorId', count: { $sum: 1 } } },
      ]),
      TransactionModel.aggregate([
        { $match: { vendorId: { $in: vendorIds }, type: 'PAYMENT', status: 'COMPLETED' } },
        { $group: { _id: '$vendorId', total: { $sum: '$amount' } } },
      ]),
    ]);
    const driverMap = new Map(driverCounts.map((d) => [d._id.toString(), d.count]));
    const vehicleMap = new Map(vehicleCounts.map((d) => [d._id.toString(), d.count]));
    const revenueMap = new Map(revenueAgg.map((d) => [d._id.toString(), d.total]));

    return {
      ...result,
      items: result.items.map((v) => ({
        ...v,
        driverCount: driverMap.get(v.id) ?? 0,
        vehicleCount: vehicleMap.get(v.id) ?? (v.vehicleCount || 0),
        totalRevenue: revenueMap.get(v.id) ?? 0,
      })),
    };
  },

  async getById(id: string) {
    const vendor = await VendorModel.findById(id);
    if (!vendor) throw new NotFoundError('Vendor not found');
    const base = mapVendor(vendor);
    const driverIds = (
      await DriverModel.find({ vendorId: vendor._id }).select('_id').lean()
    ).map((d) => d._id.toString());

    const bookingQuery =
      driverIds.length > 0
        ? {
            $or: [{ vendorId: vendor._id }, { 'driver.id': { $in: driverIds } }],
          }
        : { vendorId: vendor._id };

    const [drivers, vehicles, bookings, activities, revenueAgg, bookingCount] = await Promise.all([
      DriverModel.find({ vendorId: vendor._id }).lean(),
      VendorVehicleModel.find({ vendorId: vendor._id }).lean(),
      BookingModel.find(bookingQuery).sort({ createdAt: -1 }).limit(10).lean(),
      getEntityActivities('vendor', id),
      TransactionModel.aggregate([
        { $match: { vendorId: vendor._id, type: 'PAYMENT', status: 'COMPLETED' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      BookingModel.countDocuments(bookingQuery),
    ]);

    const customerIds = [...new Set(bookings.map((b) => b.customerId.toString()))];
    const customers = await UserModel.find({ _id: { $in: customerIds } }).lean();
    const customerMap = new Map(customers.map((c) => [c._id.toString(), c.fullName ?? 'Customer']));

    const totalRevenue = revenueAgg[0]?.total ?? 0;
    const city = vendor.address?.split(',')[0]?.trim() ?? base.city;

    return {
      ...base,
      vehicleCount: vehicles.length,
      driverCount: drivers.length,
      address: vendor.address ?? base.location,
      joinedAt: (vendor.approvedAt ?? vendor.submittedAt ?? vendor.createdAt).toISOString(),
      businessType: mapVendorTypeLabel(vendor.vendorType),
      gstNumber: '—',
      panNumber: '—',
      bankName: vendor.bankDetails?.bankName ?? '—',
      accountNumber: vendor.bankDetails?.accountNumber ?? '—',
      ifscCode: vendor.bankDetails?.ifsc ?? '—',
      serviceAreas: city ? [city] : [],
      workingHours: '24/7',
      fleetSize: vehicles.length,
      totalBookings: bookingCount,
      totalRevenue,
      documents: [],
      assignedDrivers: drivers.map((d) => ({
        id: d._id.toString(),
        name: d.name,
        phone: d.phone,
        status: mapAssignedDriverStatus(d.status),
        initials: driverInitials(d.name),
      })),
      vehicles: vehicles.map((v) => ({
        id: v._id.toString(),
        registrationNo: v.registrationNo,
        type: v.type,
        model: v.vehicleModel,
        year: v.year,
        status: v.status,
      })),
      recentBookings: bookings.map((b) => ({
        id: b._id.toString(),
        bookingNumber: b.bookingNumber,
        customerName: customerMap.get(b.customerId.toString()) ?? 'Customer',
        service: b.serviceLabel,
        driverName: b.driver?.name ?? '—',
        status: b.status,
        amount: b.invoice?.total ?? 0,
        date: b.createdAt.toISOString(),
      })),
      activities,
      quickStats: [
        {
          id: 'fleet',
          label: 'Fleet Size',
          value: String(vehicles.length),
          icon: 'Truck',
        },
        {
          id: 'bookings',
          label: 'Total Bookings',
          value: String(bookingCount),
          icon: 'ClipboardList',
        },
        {
          id: 'revenue',
          label: 'Total Revenue',
          value: formatInr(totalRevenue),
          icon: 'IndianRupee',
        },
        {
          id: 'rating',
          label: 'Average Rating',
          value: base.rating > 0 ? String(base.rating) : '—',
          icon: 'Star',
        },
      ],
    };
  },

  async create(
    input: {
      businessName: string;
      ownerName: string;
      phone: string;
      email?: string;
      city?: string;
      vendorType?: string;
    },
    actor: { id: string; name: string },
  ) {
    const vendorUser = await UserModel.create({
      mobileNumber: input.phone,
      fullName: input.ownerName,
      email: input.email,
      role: 'vendor',
      isVerified: true,
      isProfileCompleted: true,
    });

    const vendor = await VendorModel.create({
      userId: vendorUser._id,
      vendorType: (input.vendorType as never) ?? 'towing_company',
      status: 'pending',
      verificationStage: 'document_review',
      businessName: input.businessName,
      ownerName: input.ownerName,
      mobileNumber: input.phone,
      email: input.email,
      address: input.city ? `${input.city}, Odisha` : undefined,
      submittedAt: new Date(),
      statusHistory: [{ status: 'pending', changedAt: new Date() }],
    });

    await logActivity({
      actorId: actor.id,
      actorName: actor.name,
      action: 'VENDOR_CREATED',
      entityType: 'vendor',
      entityId: vendor._id.toString(),
      title: `Vendor ${vendor.businessName} created`,
    });

    await createNotification({
      title: 'New vendor created',
      message: `${vendor.businessName} added by admin`,
      category: 'vendor',
      entityType: 'vendor',
      entityId: vendor._id.toString(),
    });

    return mapVendor(vendor);
  },

  async update(
    id: string,
    input: Partial<{
      businessName: string;
      ownerName: string;
      phone: string;
      email: string;
      city: string;
      bankDetails: Record<string, string>;
    }>,
    actor: { id: string; name: string },
  ) {
    const vendor = await VendorModel.findById(id);
    if (!vendor) throw new NotFoundError('Vendor not found');

    if (input.businessName) vendor.businessName = input.businessName;
    if (input.ownerName) vendor.ownerName = input.ownerName;
    if (input.phone) vendor.mobileNumber = input.phone;
    if (input.email) vendor.email = input.email;
    if (input.city) vendor.address = `${input.city}, Odisha`;
    if (input.bankDetails) vendor.bankDetails = input.bankDetails as never;
    await vendor.save();

    await logActivity({
      actorId: actor.id,
      actorName: actor.name,
      action: 'VENDOR_UPDATED',
      entityType: 'vendor',
      entityId: id,
      title: `Vendor ${vendor.businessName ?? vendor.ownerName} updated`,
    });

    return mapVendor(vendor);
  },

  async suspend(id: string, note: string | undefined, actor: { id: string; name: string }) {
    const vendor = await VendorModel.findById(id);
    if (!vendor) throw new NotFoundError('Vendor not found');
    vendor.status = 'changes_requested';
    vendor.statusHistory.push({ status: 'changes_requested', changedAt: new Date(), note: note ?? 'Suspended' });
    await vendor.save();

    await logActivity({
      actorId: actor.id,
      actorName: actor.name,
      action: 'VENDOR_SUSPENDED',
      entityType: 'vendor',
      entityId: id,
      title: `Vendor ${vendor.businessName ?? vendor.ownerName} suspended`,
    });

    return mapVendor(vendor);
  },

  async approve(id: string, actor: { id: string; name: string }) {
    const vendor = await VendorModel.findById(id);
    if (!vendor) throw new NotFoundError('Vendor not found');
    vendor.status = 'approved';
    vendor.verificationStage = 'approved';
    vendor.approvedAt = new Date();
    vendor.statusHistory.push({ status: 'approved', changedAt: new Date(), note: 'Approved by admin' });
    await vendor.save();
    await logActivity({
      actorId: actor.id,
      actorName: actor.name,
      action: 'VENDOR_APPROVED',
      entityType: 'vendor',
      entityId: id,
      title: `Vendor ${vendor.businessName ?? vendor.ownerName} approved`,
    });
    await createNotification({
      title: 'Vendor approved',
      message: `${vendor.businessName ?? vendor.ownerName} has been approved`,
      type: 'success',
      category: 'vendor',
      entityType: 'vendor',
      entityId: id,
    });
    return mapVendor(vendor);
  },

  async reject(id: string, note: string | undefined, actor: { id: string; name: string }) {
    const vendor = await VendorModel.findById(id);
    if (!vendor) throw new NotFoundError('Vendor not found');
    vendor.status = 'rejected';
    vendor.verificationStage = 'rejected';
    vendor.reviewNotes = note;
    vendor.statusHistory.push({ status: 'rejected', changedAt: new Date(), note });
    await vendor.save();
    await logActivity({
      actorId: actor.id,
      actorName: actor.name,
      action: 'VENDOR_REJECTED',
      entityType: 'vendor',
      entityId: id,
      title: `Vendor ${vendor.businessName ?? vendor.ownerName} rejected`,
    });
    await createNotification({
      title: 'Vendor rejected',
      message: `${vendor.businessName ?? vendor.ownerName} was rejected`,
      type: 'warning',
      category: 'vendor',
      entityType: 'vendor',
      entityId: id,
    });
    return mapVendor(vendor);
  },

  async getCounts() {
    const [all, pending, approved, rejected, suspended] = await Promise.all([
      VendorModel.countDocuments(),
      VendorModel.countDocuments({ status: { $in: ['pending', 'under_review'] } }),
      VendorModel.countDocuments({ status: 'approved' }),
      VendorModel.countDocuments({ status: 'rejected' }),
      VendorModel.countDocuments({ status: 'changes_requested' }),
    ]);
    return { all, pending, approved, rejected, suspended };
  },

  async assignDrivers(id: string, driverIds: string[], actor: { id: string; name: string }) {
    const vendor = await VendorModel.findById(id);
    if (!vendor) throw new NotFoundError('Vendor not found');

    await DriverModel.updateMany(
      { _id: { $in: driverIds } },
      { $set: { vendorId: vendor._id } },
    );

    await logActivity({
      actorId: actor.id,
      actorName: actor.name,
      action: 'VENDOR_DRIVERS_ASSIGNED',
      entityType: 'vendor',
      entityId: id,
      title: `${driverIds.length} driver(s) assigned to vendor`,
    });

    return { assigned: driverIds.length };
  },
};
