import { Types } from 'mongoose';

import { UserModel, type IUser } from '../users/user.model';
import {
  mapDriverFilterToUserQuery,
  toDriverRecord,
  type DriverRecord,
} from '../users/user-profile.mappers';

export class DriverRepository {
  async create(data: {
    mobileNumber: string;
    fullName: string;
    email?: string;
    driverCode: string;
    licenseNo: string;
    driverType: string;
    vendorUserId?: Types.ObjectId | string;
    fleetSource?: 'vendor' | 'admin';
    city: string;
    state?: string;
    vehicleRegistration?: string;
    status?: DriverRecord['status'];
    statusHistory?: DriverRecord['statusHistory'];
    isVerified?: boolean;
  }): Promise<DriverRecord> {
    const user = await UserModel.create({
      mobileNumber: data.mobileNumber,
      fullName: data.fullName,
      email: data.email,
      role: 'driver',
      isVerified: data.isVerified ?? true,
      isProfileCompleted: false,
      driverProfile: {
        driverCode: data.driverCode,
        licenseNo: data.licenseNo,
        driverType: data.driverType,
        vendorUserId: data.vendorUserId
          ? new Types.ObjectId(data.vendorUserId.toString())
          : undefined,
        fleetSource: data.fleetSource,
        city: data.city,
        state: data.state ?? 'Odisha',
        vehicleRegistration: data.vehicleRegistration,
        status: data.status ?? 'PENDING',
        rating: 0,
        reviewCount: 0,
        totalTrips: 0,
        documents: [],
        statusHistory: data.statusHistory ?? [{ status: data.status ?? 'PENDING', changedAt: new Date() }],
      },
    });
    return toDriverRecord(user);
  }

  async findById(id: string): Promise<DriverRecord | null> {
    const user = await UserModel.findOne({ _id: id, role: 'driver' }).exec();
    return user?.driverProfile ? toDriverRecord(user) : null;
  }

  async findUserById(id: string): Promise<IUser | null> {
    return UserModel.findOne({ _id: id, role: 'driver' }).exec();
  }

  async updateById(id: string, data: Partial<DriverRecord>): Promise<DriverRecord | null> {
    const user = await UserModel.findOne({ _id: id, role: 'driver' });
    if (!user?.driverProfile) return null;

    if (data.name) user.fullName = data.name;
    if (data.phone) user.mobileNumber = data.phone;
    if (data.email !== undefined) user.email = data.email;

    const profile = user.driverProfile;
    if (data.driverCode) profile.driverCode = data.driverCode;
    if (data.licenseNo) profile.licenseNo = data.licenseNo;
    if (data.driverType) profile.driverType = data.driverType;
    if (data.vendorId !== undefined) {
      profile.vendorUserId = data.vendorId ? new Types.ObjectId(data.vendorId.toString()) : undefined;
    }
    if (data.city) profile.city = data.city;
    if (data.state) profile.state = data.state;
    if (data.vehicleRegistration !== undefined) profile.vehicleRegistration = data.vehicleRegistration;
    if (data.status) profile.status = data.status;
    if (data.rating != null) profile.rating = data.rating;
    if (data.reviewCount != null) profile.reviewCount = data.reviewCount;
    if (data.totalTrips != null) profile.totalTrips = data.totalTrips;
    if (data.documents) profile.documents = data.documents;
    if (data.statusHistory) profile.statusHistory = data.statusHistory;

    await user.save();
    return toDriverRecord(user);
  }

  async deleteById(id: string): Promise<DriverRecord | null> {
    const user = await UserModel.findOneAndDelete({ _id: id, role: 'driver' });
    return user?.driverProfile ? toDriverRecord(user) : null;
  }

  async count(filter: Record<string, unknown> = {}): Promise<number> {
    return UserModel.countDocuments(mapDriverFilterToUserQuery(filter));
  }

  async find(filter: Record<string, unknown> = {}): Promise<IUser[]> {
    return UserModel.find(mapDriverFilterToUserQuery(filter)).exec();
  }

  async updateManyVendor(
    driverIds: string[],
    vendorUserId: Types.ObjectId | null,
    fleetSource?: 'vendor' | 'admin',
  ): Promise<void> {
    const update = vendorUserId
      ? {
          $set: {
            'driverProfile.vendorUserId': vendorUserId,
            'driverProfile.fleetSource': fleetSource ?? 'admin',
          },
        }
      : { $unset: { 'driverProfile.vendorUserId': 1, 'driverProfile.fleetSource': 1 } };
    await UserModel.updateMany({ _id: { $in: driverIds }, role: 'driver' }, update);
  }
}

export const driverRepository = new DriverRepository();
