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
  buildVendorDocuments,
  deriveDocumentsStatus,
  mapVendorTypeLabel,
  mapVerificationStage,
  mapVerificationStageLabel,
} from '../shared/response-mappers';
import { BadRequestError, ConflictError, NotFoundError } from '../../../shared/utils/errors';

function mapAdminVendorStatus(status?: string): string {
  switch (String(status ?? 'PENDING').toUpperCase()) {
    case 'APPROVED':
      return 'approved';
    case 'REJECTED':
      return 'rejected';
    case 'SUSPENDED':
      return 'changes_requested';
    default:
      return 'pending';
  }
}

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
  const documents = buildVendorDocuments(vendor);
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
    verificationStatus: mapVerificationStage(vendor.verificationStage, vendor.status),
    documentsStatus: deriveDocumentsStatus(documents),
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
    if (filters.verification && filters.verification !== 'ALL') {
      if (filters.verification === 'VERIFIED') {
        query.verificationStage = 'approved';
        query.status = 'approved';
      } else if (filters.verification === 'REJECTED') {
        query.$or = [{ verificationStage: 'rejected' }, { status: 'rejected' }];
      } else {
        query.status = { $in: ['pending', 'under_review'] };
        query.verificationStage = { $nin: ['approved', 'rejected'] };
      }
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
    const documents = buildVendorDocuments(vendor);

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
      totalBookings: bookingCount,
      totalRevenue,
      verificationStage: vendor.verificationStage,
      verificationStageLabel: mapVerificationStageLabel(vendor.verificationStage),
      reviewNotes: vendor.reviewNotes ?? '',
      documentsStatus: deriveDocumentsStatus(documents),
      documents,
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
      businessName?: string;
      ownerName?: string;
      phone?: string;
      email?: string;
      city?: string;
      vendorType?: string;
      status?: string;
    },
    actor: { id: string; name: string },
  ) {
    const businessName = input.businessName?.trim();
    const ownerName = input.ownerName?.trim();
    const phone = input.phone?.trim();
    const email = input.email?.trim();
    const city = input.city?.trim();

    if (!businessName) throw new BadRequestError('Business name is required');
    if (!ownerName) throw new BadRequestError('Owner name is required');
    if (!phone) throw new BadRequestError('Phone is required');

    const existingUser = await UserModel.findOne({ mobileNumber: phone });
    if (existingUser) {
      throw new ConflictError('A user with this phone number already exists');
    }

    const vendorStatus = mapAdminVendorStatus(input.status);
    const isApproved = vendorStatus === 'approved';

    const vendorUser = await UserModel.create({
      mobileNumber: phone,
      fullName: ownerName,
      email: email || undefined,
      role: 'vendor',
      isVerified: true,
      isProfileCompleted: false,
    });

    const vendor = await VendorModel.create({
      userId: vendorUser._id,
      vendorType: (input.vendorType as never) ?? 'towing_company',
      status: vendorStatus,
      verificationStage: isApproved ? 'approved' : 'document_review',
      businessName,
      ownerName,
      mobileNumber: phone,
      email: email || undefined,
      address: city ? `${city}, Odisha` : undefined,
      submittedAt: new Date(),
      approvedAt: isApproved ? new Date() : undefined,
      statusHistory: [{ status: vendorStatus, changedAt: new Date(), note: 'Created by admin' }],
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
      status: string;
      bankDetails: Record<string, string>;
    }>,
    actor: { id: string; name: string },
  ) {
    const vendor = await VendorModel.findById(id);
    if (!vendor) throw new NotFoundError('Vendor not found');

    if (input.businessName) vendor.businessName = input.businessName;
    if (input.ownerName) vendor.ownerName = input.ownerName;
    if (input.phone) {
      const phone = input.phone.trim();
      const duplicate = await UserModel.findOne({
        mobileNumber: phone,
        _id: { $ne: vendor.userId },
      });
      if (duplicate) throw new ConflictError('A user with this phone number already exists');
      vendor.mobileNumber = phone;
      await UserModel.findByIdAndUpdate(vendor.userId, { mobileNumber: phone });
    }
    if (input.email !== undefined) vendor.email = input.email;
    if (input.city) vendor.address = `${input.city}, Odisha`;
    if (input.status) {
      const vendorStatus = mapAdminVendorStatus(input.status);
      vendor.status = vendorStatus as never;
      if (vendorStatus === 'approved') {
        vendor.verificationStage = 'approved';
        vendor.approvedAt = new Date();
      }
      vendor.statusHistory.push({
        status: vendorStatus as never,
        changedAt: new Date(),
        note: 'Updated by admin',
      });
    }
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

  async reviewDocument(
    id: string,
    docKey: string,
    status: 'VERIFIED' | 'REJECTED',
    actor: { id: string; name: string },
  ) {
    if (status !== 'VERIFIED' && status !== 'REJECTED') {
      throw new BadRequestError('Invalid document status');
    }
    const vendor = await VendorModel.findById(id);
    if (!vendor) throw new NotFoundError('Vendor not found');

    const reviews = [...(vendor.documentReviews ?? [])];
    const idx = reviews.findIndex((review) => review.key === docKey);
    const entry = { key: docKey, status, reviewedAt: new Date() };
    if (idx >= 0) reviews[idx] = entry;
    else reviews.push(entry);
    vendor.documentReviews = reviews;
    vendor.verificationStage = 'document_review';
    await vendor.save();

    await logActivity({
      actorId: actor.id,
      actorName: actor.name,
      action: status === 'VERIFIED' ? 'VENDOR_DOCUMENT_VERIFIED' : 'VENDOR_DOCUMENT_REJECTED',
      entityType: 'vendor',
      entityId: id,
      title: `${docKey} ${status === 'VERIFIED' ? 'verified' : 'rejected'} for ${vendor.businessName ?? vendor.ownerName}`,
    });

    return this.getById(id);
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

  async remove(id: string, actor: { id: string; name: string }) {
    const vendor = await VendorModel.findById(id);
    if (!vendor) throw new NotFoundError('Vendor not found');

    const vendorName = vendor.businessName ?? vendor.ownerName ?? 'Vendor';

    await Promise.all([
      DriverModel.updateMany({ vendorId: vendor._id }, { $unset: { vendorId: 1 } }),
      VendorVehicleModel.deleteMany({ vendorId: vendor._id }),
      BookingModel.updateMany({ vendorId: vendor._id }, { $unset: { vendorId: 1 } }),
      TransactionModel.updateMany({ vendorId: vendor._id }, { $unset: { vendorId: 1 } }),
    ]);

    await VendorModel.findByIdAndDelete(id);
    if (vendor.userId) {
      await UserModel.findByIdAndDelete(vendor.userId);
    }

    await logActivity({
      actorId: actor.id,
      actorName: actor.name,
      action: 'VENDOR_DELETED',
      entityType: 'vendor',
      entityId: id,
      title: `Vendor ${vendorName} deleted`,
    });
  },
};
