import { Types } from 'mongoose';

import { VendorModel } from '../../vendors/vendor.model';
import { DriverModel, type IDriver } from '../models/driver.model';
import { escapeRegex, paginate } from '../shared/pagination';
import { logActivity } from '../shared/activity-logger';
import { NotFoundError } from '../../../shared/utils/errors';

async function mapDriver(driver: {
  _id: Types.ObjectId;
  driverCode: string;
  name: string;
  phone: string;
  licenseNo: string;
  driverType: string;
  vendorId?: Types.ObjectId;
  city: string;
  vehicleRegistration?: string;
  rating: number;
  reviewCount: number;
  status: string;
}, vendorName?: string) {
  return {
    id: driver._id.toString(),
    name: driver.name,
    phone: driver.phone,
    licenseNo: driver.licenseNo,
    driverType: driver.driverType,
    vendorId: driver.vendorId?.toString() ?? '',
    vendorName: vendorName ?? '—',
    city: driver.city,
    vehicleRegistration: driver.vehicleRegistration ?? '—',
    rating: driver.rating,
    reviewCount: driver.reviewCount,
    status: driver.status,
  };
}

export const adminDriversService = {
  async list(filters: {
    search?: string;
    status?: string;
    city?: string;
    vendorId?: string;
    page?: number;
    pageSize?: number;
  }) {
    const query: Record<string, unknown> = {};
    if (filters.status && filters.status !== 'ALL') query.status = filters.status;
    if (filters.city && filters.city !== 'ALL') query.city = filters.city;
    if (filters.vendorId && filters.vendorId !== 'ALL') query.vendorId = filters.vendorId;
    if (filters.search?.trim()) {
      const regex = new RegExp(escapeRegex(filters.search.trim()), 'i');
      query.$or = [{ name: regex }, { phone: regex }, { licenseNo: regex }, { driverCode: regex }];
    }

    const result = await paginate<IDriver, IDriver>(DriverModel, query, filters, (doc) => doc);
    const vendorIds = [...new Set(result.items.map((d) => d.vendorId?.toString()).filter(Boolean))];
    const vendors = await VendorModel.find({ _id: { $in: vendorIds } }).lean();
    const vendorMap = new Map(vendors.map((v) => [v._id.toString(), v.businessName ?? v.ownerName ?? 'Vendor']));

    return {
      ...result,
      items: await Promise.all(
        result.items.map((d) =>
          mapDriver(d, d.vendorId ? vendorMap.get(d.vendorId.toString()) : undefined),
        ),
      ),
    };
  },

  async getById(id: string) {
    const driver = await DriverModel.findById(id);
    if (!driver) throw new NotFoundError('Driver not found');
    let vendorName: string | undefined;
    if (driver.vendorId) {
      const vendor = await VendorModel.findById(driver.vendorId).lean();
      vendorName = vendor?.businessName ?? vendor?.ownerName;
    }
    const base = await mapDriver(driver, vendorName);
    return {
      ...base,
      email: driver.email,
      state: driver.state,
      totalTrips: driver.totalTrips,
      documents: driver.documents,
      statusHistory: driver.statusHistory,
      activities: [],
      bookings: [],
      earnings: { total: 0, thisMonth: 0, pending: 0 },
    };
  },

  async create(input: Record<string, string>, actor: { id: string; name: string }) {
    const count = await DriverModel.countDocuments();
    const driver = await DriverModel.create({
      driverCode: `DRV${String(count + 1).padStart(4, '0')}`,
      name: input.name,
      phone: input.phone,
      email: input.email,
      licenseNo: input.licenseNo,
      driverType: input.driverType ?? 'Tow Driver',
      vendorId: input.vendorId || undefined,
      city: input.city ?? 'Bhubaneswar',
      state: input.state ?? 'Odisha',
      vehicleRegistration: input.vehicleRegistration,
      status: input.status ?? 'PENDING',
      statusHistory: [{ status: (input.status ?? 'PENDING') as never, changedAt: new Date() }],
    });

    await logActivity({
      actorId: actor.id,
      actorName: actor.name,
      action: 'DRIVER_CREATED',
      entityType: 'driver',
      entityId: driver._id.toString(),
      title: `Driver ${driver.name} created`,
    });

    return mapDriver(driver);
  },

  async update(id: string, input: Record<string, string>, actor: { id: string; name: string }) {
    const driver = await DriverModel.findById(id);
    if (!driver) throw new NotFoundError('Driver not found');

    Object.assign(driver, {
      name: input.name ?? driver.name,
      phone: input.phone ?? driver.phone,
      email: input.email ?? driver.email,
      licenseNo: input.licenseNo ?? driver.licenseNo,
      driverType: input.driverType ?? driver.driverType,
      city: input.city ?? driver.city,
      vehicleRegistration: input.vehicleRegistration ?? driver.vehicleRegistration,
      vendorId: input.vendorId || driver.vendorId,
      status: input.status ?? driver.status,
    });
    await driver.save();

    await logActivity({
      actorId: actor.id,
      actorName: actor.name,
      action: 'DRIVER_UPDATED',
      entityType: 'driver',
      entityId: driver._id.toString(),
      title: `Driver ${driver.name} updated`,
    });

    return mapDriver(driver);
  },

  async remove(id: string, actor: { id: string; name: string }) {
    const driver = await DriverModel.findByIdAndDelete(id);
    if (!driver) throw new NotFoundError('Driver not found');
    await logActivity({
      actorId: actor.id,
      actorName: actor.name,
      action: 'DRIVER_DELETED',
      entityType: 'driver',
      entityId: id,
      title: `Driver ${driver.name} deleted`,
    });
  },

  async getCounts() {
    const [all, pending, approved, rejected, suspended] = await Promise.all([
      DriverModel.countDocuments(),
      DriverModel.countDocuments({ status: 'PENDING' }),
      DriverModel.countDocuments({ status: 'APPROVED' }),
      DriverModel.countDocuments({ status: 'REJECTED' }),
      DriverModel.countDocuments({ status: 'SUSPENDED' }),
    ]);
    return { all, pending, approved, rejected, suspended };
  },
};
