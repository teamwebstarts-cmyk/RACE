import { Types } from 'mongoose';

import { BookingModel } from '../../bookings/booking.model';
import { UserModel } from '../../users/user.model';
import { VehicleModel } from '../../vehicles/vehicle.model';
import { escapeRegex, paginate } from '../shared/pagination';
import { logActivity } from '../shared/activity-logger';
import { NotFoundError } from '../../../shared/utils/errors';

function mapCustomer(user: {
  _id: Types.ObjectId;
  customerCode?: string;
  fullName?: string;
  mobileNumber: string;
  email?: string;
  address?: { city?: string; state?: string };
  accountStatus?: string;
  createdAt: Date;
}, vehicleCount = 0, totalBookings = 0) {
  return {
    id: user._id.toString(),
    customerId: user.customerCode ?? `CUST${user._id.toString().slice(-6).toUpperCase()}`,
    name: user.fullName ?? 'Unnamed Customer',
    phone: user.mobileNumber,
    email: user.email ?? '',
    city: user.address?.city ?? '—',
    state: user.address?.state ?? 'Odisha',
    vehicleCount,
    totalBookings,
    status: (user.accountStatus ?? 'ACTIVE') as 'ACTIVE' | 'SUSPENDED' | 'INACTIVE',
    joinedAt: user.createdAt.toISOString(),
  };
}

export const adminCustomersService = {
  async list(filters: {
    search?: string;
    status?: string;
    city?: string;
    page?: number;
    pageSize?: number;
  }) {
    const query: Record<string, unknown> = { role: 'customer' };

    if (filters.status && filters.status !== 'ALL') {
      query.accountStatus = filters.status;
    }

    if (filters.city && filters.city !== 'ALL') {
      query['address.city'] = filters.city;
    }

    if (filters.search?.trim()) {
      const regex = new RegExp(escapeRegex(filters.search.trim()), 'i');
      query.$or = [
        { fullName: regex },
        { mobileNumber: regex },
        { email: regex },
        { customerCode: regex },
      ];
    }

    return paginate(UserModel, query, filters, (doc) => mapCustomer(doc as never));
  },

  async getById(id: string) {
    const user = await UserModel.findOne({ _id: id, role: 'customer' });
    if (!user) throw new NotFoundError('Customer not found');

    const [vehicleCount, bookings, payments] = await Promise.all([
      VehicleModel.countDocuments({ customerId: user._id }),
      BookingModel.find({ customerId: user._id }).sort({ createdAt: -1 }).limit(20).lean(),
      BookingModel.aggregate([
        { $match: { customerId: user._id } },
        { $group: { _id: null, total: { $sum: '$invoice.total' } } },
      ]),
    ]);

    const base = mapCustomer(user, vehicleCount, bookings.length);

    return {
      ...base,
      address: [user.address?.line1, user.address?.line2, user.address?.city, user.address?.state]
        .filter(Boolean)
        .join(', '),
      dateOfBirth: user.dateOfBirth?.toISOString(),
      emergencyContact: user.emergencyContact
        ? `${user.emergencyContact.name} (${user.emergencyContact.mobileNumber})`
        : undefined,
      totalSpent: payments[0]?.total ?? 0,
      bookingHistory: bookings.map((b) => ({
        id: b._id.toString(),
        bookingNumber: b.bookingNumber,
        service: b.serviceLabel,
        status: b.status,
        amount: b.invoice?.total ?? 0,
        date: b.createdAt.toISOString(),
        vendorName: undefined,
        driverName: b.driver?.name,
      })),
      payments: [],
      subscriptions: [],
      vehicles: [],
      notes: '',
    };
  },

  async create(input: {
    name: string;
    phone: string;
    email?: string;
    city?: string;
    state?: string;
    status?: string;
  }, actor: { id: string; name: string }) {
    const count = await UserModel.countDocuments({ role: 'customer' });
    const user = await UserModel.create({
      mobileNumber: input.phone,
      fullName: input.name,
      email: input.email,
      role: 'customer',
      isVerified: true,
      isProfileCompleted: true,
      accountStatus: input.status ?? 'ACTIVE',
      customerCode: `CUST${String(count + 1).padStart(4, '0')}`,
      address: { city: input.city, state: input.state ?? 'Odisha', country: 'India' },
    });

    await logActivity({
      actorId: actor.id,
      actorName: actor.name,
      action: 'CUSTOMER_CREATED',
      entityType: 'customer',
      entityId: user._id.toString(),
      title: `Customer ${user.fullName} created`,
    });

    return mapCustomer(user);
  },

  async update(id: string, input: Partial<{
    name: string;
    phone: string;
    email: string;
    city: string;
    state: string;
    status: string;
  }>, actor: { id: string; name: string }) {
    const user = await UserModel.findOne({ _id: id, role: 'customer' });
    if (!user) throw new NotFoundError('Customer not found');

    if (input.name) user.fullName = input.name;
    if (input.phone) user.mobileNumber = input.phone;
    if (input.email) user.email = input.email;
    if (input.status) user.accountStatus = input.status as never;
    if (input.city || input.state) {
      user.address = { ...user.address, city: input.city ?? user.address?.city, state: input.state ?? user.address?.state };
    }
    await user.save();

    await logActivity({
      actorId: actor.id,
      actorName: actor.name,
      action: 'CUSTOMER_UPDATED',
      entityType: 'customer',
      entityId: user._id.toString(),
      title: `Customer ${user.fullName} updated`,
    });

    return mapCustomer(user);
  },

  async setStatus(id: string, status: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE', actor: { id: string; name: string }) {
    const user = await UserModel.findOneAndUpdate(
      { _id: id, role: 'customer' },
      { accountStatus: status },
      { new: true },
    );
    if (!user) throw new NotFoundError('Customer not found');

    await logActivity({
      actorId: actor.id,
      actorName: actor.name,
      action: `CUSTOMER_${status}`,
      entityType: 'customer',
      entityId: user._id.toString(),
      title: `Customer ${user.fullName} marked ${status}`,
    });

    return mapCustomer(user);
  },

  async remove(id: string, actor: { id: string; name: string }) {
    const user = await UserModel.findOneAndDelete({ _id: id, role: 'customer' });
    if (!user) throw new NotFoundError('Customer not found');

    await logActivity({
      actorId: actor.id,
      actorName: actor.name,
      action: 'CUSTOMER_DELETED',
      entityType: 'customer',
      entityId: id,
      title: `Customer ${user.fullName} deleted`,
    });
  },

  async export(filters: { search?: string; status?: string; city?: string }) {
    const result = await this.list({ ...filters, page: 1, pageSize: 10000 });
    return result.items;
  },

  async getCities() {
    const cities = await UserModel.distinct('address.city', { role: 'customer', 'address.city': { $ne: null } });
    return cities.filter(Boolean).sort();
  },
};
