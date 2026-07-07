import { Types } from 'mongoose';

import { UserModel } from '../../users/user.model';
import { driverRepository } from '../../users/driver.repository';
import { vendorRepository } from '../../vendors/vendor.repository';
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
import {
  mapVendorFilterToUserQuery,
  toVendorRecord,
} from '../../users/user-profile.mappers';
import { BadRequestError, ConflictError, NotFoundError } from '../../../shared/utils/errors';
import type { IUser } from '../../users/user.model';

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

function mapVendorFromUser(user: IUser) {
  const vendor = toVendorRecord(user);
  const city = vendor.address?.split(',')[0] ?? 'Odisha';
  const status = mapVendorStatus(vendor.status);
  const documents = buildVendorDocuments(vendor);
  return {
    id: vendor.id,
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

    const userQuery = mapVendorFilterToUserQuery(query);
    const result = await paginate(UserModel, userQuery, filters as never, (doc) =>
      mapVendorFromUser(doc as IUser),
    );

    const vendorIds = result.items.map((v) => new Types.ObjectId(v.id));
    const [driverCounts, vehicleCounts, revenueAgg] = await Promise.all([
      UserModel.aggregate([
        { $match: { role: 'driver', 'driverProfile.vendorUserId': { $in: vendorIds } } },
        { $group: { _id: '$driverProfile.vendorUserId', count: { $sum: 1 } } },
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
    const user = await UserModel.findOne({ _id: id, role: 'vendor' });
    if (!user?.vendorProfile) throw new NotFoundError('Vendor not found');
    const vendor = toVendorRecord(user);
    const base = mapVendorFromUser(user);
    const driverUsers = await UserModel.find({ role: 'driver', 'driverProfile.vendorUserId': user._id }).lean();
    const driverIds = driverUsers.map((d) => d._id.toString());

    const bookingQuery =
      driverIds.length > 0
        ? { $or: [{ vendorId: user._id }, { 'driver.id': { $in: driverIds } }] }
        : { vendorId: user._id };

    const [vehicles, bookings, activities, revenueAgg, bookingCount] = await Promise.all([
      VendorVehicleModel.find({ vendorId: user._id }).lean(),
      BookingModel.find(bookingQuery).sort({ createdAt: -1 }).limit(10).lean(),
      getEntityActivities('vendor', id),
      TransactionModel.aggregate([
        { $match: { vendorId: user._id, type: 'PAYMENT', status: 'COMPLETED' } },
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
      driverCount: driverUsers.length,
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
      assignedDrivers: driverUsers.map((d) => ({
        id: d._id.toString(),
        name: d.fullName ?? 'Driver',
        phone: d.mobileNumber,
        status: mapAssignedDriverStatus(d.driverProfile?.status ?? 'PENDING'),
        initials: driverInitials(d.fullName ?? 'Driver'),
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
        { id: 'bookings', label: 'Total Bookings', value: String(bookingCount), icon: 'ClipboardList' },
        { id: 'revenue', label: 'Total Revenue', value: formatInr(totalRevenue), icon: 'IndianRupee' },
        { id: 'rating', label: 'Average Rating', value: base.rating > 0 ? String(base.rating) : '—', icon: 'Star' },
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
    if (existingUser) throw new ConflictError('A user with this phone number already exists');

    const vendorStatus = mapAdminVendorStatus(input.status);
    const isApproved = vendorStatus === 'approved';

    const vendor = await vendorRepository.create({
      vendorType: (input.vendorType as never) ?? 'towing_company',
      status: vendorStatus as never,
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
      entityId: vendor.id,
      title: `Vendor ${vendor.businessName} created`,
    });

    await createNotification({
      title: 'New vendor created',
      message: `${vendor.businessName} added by admin`,
      category: 'vendor',
      entityType: 'vendor',
      entityId: vendor.id,
    });

    return mapVendorFromUser((await UserModel.findById(vendor.id))!);
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
    const user = await UserModel.findOne({ _id: id, role: 'vendor' });
    if (!user?.vendorProfile) throw new NotFoundError('Vendor not found');

    if (input.businessName) user.vendorProfile.businessName = input.businessName;
    if (input.ownerName) {
      user.vendorProfile.ownerName = input.ownerName;
      user.fullName = input.ownerName;
    }
    if (input.phone) {
      const phone = input.phone.trim();
      const duplicate = await UserModel.findOne({ mobileNumber: phone, _id: { $ne: user._id } });
      if (duplicate) throw new ConflictError('A user with this phone number already exists');
      user.mobileNumber = phone;
    }
    if (input.email !== undefined) user.email = input.email;
    if (input.city) user.vendorProfile.address = `${input.city}, Odisha`;
    if (input.status) {
      const vendorStatus = mapAdminVendorStatus(input.status);
      user.vendorProfile.status = vendorStatus as never;
      if (vendorStatus === 'approved') {
        user.vendorProfile.verificationStage = 'approved';
        user.vendorProfile.approvedAt = new Date();
      }
      user.vendorProfile.statusHistory.push({
        status: vendorStatus,
        changedAt: new Date(),
        note: 'Updated by admin',
      });
    }
    if (input.bankDetails) user.vendorProfile.bankDetails = input.bankDetails as never;
    await user.save();

    await logActivity({
      actorId: actor.id,
      actorName: actor.name,
      action: 'VENDOR_UPDATED',
      entityType: 'vendor',
      entityId: id,
      title: `Vendor ${user.vendorProfile.businessName ?? user.vendorProfile.ownerName} updated`,
    });

    return mapVendorFromUser(user);
  },

  async suspend(id: string, note: string | undefined, actor: { id: string; name: string }) {
    const user = await UserModel.findOne({ _id: id, role: 'vendor' });
    if (!user?.vendorProfile) throw new NotFoundError('Vendor not found');
    user.vendorProfile.status = 'changes_requested';
    user.vendorProfile.statusHistory.push({
      status: 'changes_requested',
      changedAt: new Date(),
      note: note ?? 'Suspended',
    });
    await user.save();

    await logActivity({
      actorId: actor.id,
      actorName: actor.name,
      action: 'VENDOR_SUSPENDED',
      entityType: 'vendor',
      entityId: id,
      title: `Vendor ${user.vendorProfile.businessName ?? user.vendorProfile.ownerName} suspended`,
    });

    return mapVendorFromUser(user);
  },

  async approve(id: string, actor: { id: string; name: string }) {
    const user = await UserModel.findOne({ _id: id, role: 'vendor' });
    if (!user?.vendorProfile) throw new NotFoundError('Vendor not found');
    user.vendorProfile.status = 'approved';
    user.vendorProfile.verificationStage = 'approved';
    user.vendorProfile.approvedAt = new Date();
    user.vendorProfile.statusHistory.push({
      status: 'approved',
      changedAt: new Date(),
      note: 'Approved by admin',
    });
    await user.save();

    await logActivity({
      actorId: actor.id,
      actorName: actor.name,
      action: 'VENDOR_APPROVED',
      entityType: 'vendor',
      entityId: id,
      title: `Vendor ${user.vendorProfile.businessName ?? user.vendorProfile.ownerName} approved`,
    });
    await createNotification({
      title: 'Vendor approved',
      message: `${user.vendorProfile.businessName ?? user.vendorProfile.ownerName} has been approved`,
      type: 'success',
      category: 'vendor',
      entityType: 'vendor',
      entityId: id,
    });
    return mapVendorFromUser(user);
  },

  async reject(id: string, note: string | undefined, actor: { id: string; name: string }) {
    const user = await UserModel.findOne({ _id: id, role: 'vendor' });
    if (!user?.vendorProfile) throw new NotFoundError('Vendor not found');
    user.vendorProfile.status = 'rejected';
    user.vendorProfile.verificationStage = 'rejected';
    user.vendorProfile.reviewNotes = note;
    user.vendorProfile.statusHistory.push({ status: 'rejected', changedAt: new Date(), note });
    await user.save();

    await logActivity({
      actorId: actor.id,
      actorName: actor.name,
      action: 'VENDOR_REJECTED',
      entityType: 'vendor',
      entityId: id,
      title: `Vendor ${user.vendorProfile.businessName ?? user.vendorProfile.ownerName} rejected`,
    });
    await createNotification({
      title: 'Vendor rejected',
      message: `${user.vendorProfile.businessName ?? user.vendorProfile.ownerName} was rejected`,
      type: 'warning',
      category: 'vendor',
      entityType: 'vendor',
      entityId: id,
    });
    return mapVendorFromUser(user);
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
    const user = await UserModel.findOne({ _id: id, role: 'vendor' });
    if (!user?.vendorProfile) throw new NotFoundError('Vendor not found');

    const reviews = [...(user.vendorProfile.documentReviews ?? [])];
    const idx = reviews.findIndex((review) => review.key === docKey);
    const entry = { key: docKey, status, reviewedAt: new Date() };
    if (idx >= 0) reviews[idx] = entry;
    else reviews.push(entry);
    user.vendorProfile.documentReviews = reviews;
    user.vendorProfile.verificationStage = 'document_review';
    await user.save();

    await logActivity({
      actorId: actor.id,
      actorName: actor.name,
      action: status === 'VERIFIED' ? 'VENDOR_DOCUMENT_VERIFIED' : 'VENDOR_DOCUMENT_REJECTED',
      entityType: 'vendor',
      entityId: id,
      title: `${docKey} ${status === 'VERIFIED' ? 'verified' : 'rejected'} for ${user.vendorProfile.businessName ?? user.vendorProfile.ownerName}`,
    });

    return this.getById(id);
  },

  async getCounts() {
    const [all, pending, approved, rejected, suspended] = await Promise.all([
      vendorRepository.countUsers({}),
      vendorRepository.countUsers({ status: { $in: ['pending', 'under_review'] } }),
      vendorRepository.countUsers({ status: 'approved' }),
      vendorRepository.countUsers({ status: 'rejected' }),
      vendorRepository.countUsers({ status: 'changes_requested' }),
    ]);
    return { all, pending, approved, rejected, suspended };
  },

  async assignDrivers(id: string, driverIds: string[], actor: { id: string; name: string }) {
    const user = await UserModel.findOne({ _id: id, role: 'vendor' });
    if (!user?.vendorProfile) throw new NotFoundError('Vendor not found');

    await driverRepository.updateManyVendor(driverIds, user._id);

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
    const user = await UserModel.findOne({ _id: id, role: 'vendor' });
    if (!user?.vendorProfile) throw new NotFoundError('Vendor not found');

    const vendorName = user.vendorProfile.businessName ?? user.vendorProfile.ownerName ?? 'Vendor';

    await Promise.all([
      UserModel.updateMany(
        { role: 'driver', 'driverProfile.vendorUserId': user._id },
        { $unset: { 'driverProfile.vendorUserId': 1 } },
      ),
      VendorVehicleModel.deleteMany({ vendorId: user._id }),
      BookingModel.updateMany({ vendorId: user._id }, { $unset: { vendorId: 1 } }),
      TransactionModel.updateMany({ vendorId: user._id }, { $unset: { vendorId: 1 } }),
    ]);

    await UserModel.findByIdAndDelete(user._id);

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
