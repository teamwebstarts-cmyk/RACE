import { Types } from 'mongoose';

import { VendorModel } from '../../vendors/vendor.model';
import { DriverModel } from '../models/driver.model';
import { escapeRegex, paginate } from '../shared/pagination';
import { logActivity } from '../shared/activity-logger';
import { NotFoundError } from '../../../shared/utils/errors';

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
    rating: 4.5,
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
    const driverCounts = await DriverModel.aggregate([
      { $match: { vendorId: { $in: vendorIds } } },
      { $group: { _id: '$vendorId', count: { $sum: 1 } } },
    ]);
    const driverMap = new Map(driverCounts.map((d) => [d._id.toString(), d.count]));

    return {
      ...result,
      items: result.items.map((v) => ({
        ...v,
        driverCount: driverMap.get(v.id) ?? 0,
      })),
    };
  },

  async getById(id: string) {
    const vendor = await VendorModel.findById(id);
    if (!vendor) throw new NotFoundError('Vendor not found');
    const base = mapVendor(vendor);
    const drivers = await DriverModel.find({ vendorId: vendor._id }).lean();
    return {
      ...base,
      address: vendor.address,
      bankDetails: vendor.bankDetails,
      towVehicle: vendor.towVehicle,
      driverProfile: vendor.driverProfile,
      statusHistory: vendor.statusHistory,
      documents: [],
      assignedDrivers: drivers.map((d) => ({
        id: d._id.toString(),
        name: d.name,
        phone: d.phone,
        status: d.status,
      })),
      vehicles: [],
      bookings: [],
      activities: [],
      stats: { totalBookings: 0, revenue: 0, rating: base.rating },
    };
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
    return mapVendor(vendor);
  },

  async getCounts() {
    const [all, pending, approved, rejected] = await Promise.all([
      VendorModel.countDocuments(),
      VendorModel.countDocuments({ status: { $in: ['pending', 'under_review'] } }),
      VendorModel.countDocuments({ status: 'approved' }),
      VendorModel.countDocuments({ status: 'rejected' }),
    ]);
    return { all, pending, approved, rejected, suspended: 0 };
  },
};
