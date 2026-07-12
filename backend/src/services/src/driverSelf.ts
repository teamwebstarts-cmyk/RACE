import { BadRequestError, NotFoundError } from '../../utils/src/errors';
import { UserModel } from '../../models/src/user';
import { driverRepository } from './driverRepository';
import { z } from 'zod';

export const registerDriverSelfSchema = z.object({
  fullName: z.string().min(2).max(100),
  email: z.string().email().optional(),
  address: z.string().min(5).max(300).optional(),
  licenseNo: z.string().min(4).max(40),
  driverType: z.enum(['Tow Driver', 'Full-Time', 'Part-Time']).default('Tow Driver'),
  vehicleRegistration: z.string().min(4).max(20).optional(),
  city: z.string().min(2).max(100).optional(),
  vehicleType: z.string().max(50).optional(),
});

export type RegisterDriverSelfDto = z.infer<typeof registerDriverSelfSchema>;

export class DriverSelfService {
  async register(userId: string, dto: RegisterDriverSelfDto) {
    const user = await UserModel.findById(userId).exec();
    if (!user) throw new NotFoundError('User not found');

    if (user.role === 'vendor') {
      throw new BadRequestError('Vendor accounts cannot register as drivers on this path');
    }

    const status = process.env.NODE_ENV === 'production' ? 'PENDING' : 'APPROVED';

    if (user.role === 'driver' && user.driverProfile) {
      user.fullName = dto.fullName;
      if (dto.email) user.email = dto.email;
      user.driverProfile.licenseNo = dto.licenseNo;
      user.driverProfile.driverType = dto.driverType;
      user.driverProfile.city = dto.city ?? user.driverProfile.city ?? 'Bhubaneswar';
      if (dto.vehicleRegistration) {
        user.driverProfile.vehicleRegistration = dto.vehicleRegistration;
      }
      user.driverProfile.status = status as 'PENDING' | 'APPROVED';
      user.isProfileCompleted = true;
      user.isVerified = true;
      if (!user.currentLocation) {
        user.currentLocation = {
          latitude: 20.2961,
          longitude: 85.8245,
          updatedAt: new Date(),
        };
      }
      await user.save();
      return {
        id: user.id,
        role: user.role,
        fullName: user.fullName,
        status: user.driverProfile.status,
        isProfileCompleted: user.isProfileCompleted,
      };
    }

    // Promote customer → driver
    const count = await driverRepository.count();
    const driverCode = user.driverProfile?.driverCode ?? `DRV${String(count + 1).padStart(4, '0')}`;

    user.role = 'driver';
    user.fullName = dto.fullName;
    if (dto.email) user.email = dto.email;
    user.isVerified = true;
    user.isProfileCompleted = true;
    user.isAvailable = true;
    user.currentLocation = {
      latitude: 20.2961,
      longitude: 85.8245,
      updatedAt: new Date(),
    };
    user.driverProfile = {
      driverCode,
      licenseNo: dto.licenseNo,
      driverType: dto.driverType,
      city: dto.city ?? 'Bhubaneswar',
      state: 'Odisha',
      vehicleRegistration: dto.vehicleRegistration,
      status: status as 'PENDING' | 'APPROVED',
      rating: 0,
      reviewCount: 0,
      totalTrips: 0,
      documents: [],
      statusHistory: [{ status: status as 'PENDING' | 'APPROVED', changedAt: new Date() }],
    };
    await user.save();

    return {
      id: user.id,
      role: user.role,
      fullName: user.fullName,
      status,
      isProfileCompleted: true,
    };
  }
}

export const driverSelfService = new DriverSelfService();
