import { Types } from 'mongoose';

import { BadRequestError, ConflictError, ForbiddenError, NotFoundError } from '../../utils/src/errors';
import { normalizeMobileNumber } from '../../utils/src/otp';
import { storageService } from '../../storage/src/index';
import { UserModel, type IUser } from '../../models/src/user';
import { driverRepository } from './driverRepository';
import type { CreateVendorDriverDto } from './vendorDriversValidator';

function mapFleetDriver(user: IUser) {
  const profile = user.driverProfile;
  return {
    id: user.id,
    name: user.fullName ?? 'Driver',
    phone: user.mobileNumber,
    email: user.email,
    driverType: profile?.driverType ?? 'Tow Driver',
    licenseNo: profile?.licenseNo ?? '',
    city: profile?.city ?? '',
    vehicleRegistration: profile?.vehicleRegistration,
    status: profile?.status ?? 'PENDING',
    isAvailable: Boolean(user.isAvailable),
    isBusy: Boolean(user.activeBookingId),
    rating: profile?.rating ?? 0,
    vendorId: profile?.vendorUserId?.toString() ?? '',
  };
}

export class VendorDriversService {
  private async assertVendor(userId: string) {
    const user = await UserModel.findById(userId).exec();
    if (!user || user.role !== 'vendor') {
      throw new ForbiddenError('Vendor access only');
    }
    return user;
  }

  private async assertVendorApproved(userId: string) {
    const user = await this.assertVendor(userId);
    const status = user.vendorProfile?.status;
    if (status !== 'approved') {
      throw new ForbiddenError(
        'Your vendor account must be approved by admin before you can add fleet drivers.',
      );
    }
    return user;
  }

  async list(vendorUserId: string) {
    await this.assertVendor(vendorUserId);
    const drivers = await UserModel.find({
      role: 'driver',
      'driverProfile.vendorUserId': new Types.ObjectId(vendorUserId),
    }).exec();
    return drivers.map(mapFleetDriver);
  }

  async create(vendorUserId: string, dto: CreateVendorDriverDto) {
    await this.assertVendorApproved(vendorUserId);
    const phone = normalizeMobileNumber(dto.phone);

    const existing = await UserModel.findOne({ mobileNumber: phone }).exec();
    if (existing) {
      if (existing.role !== 'driver' || !existing.driverProfile) {
        throw new ConflictError('This mobile number is already registered as a non-driver account');
      }
      const currentVendor = existing.driverProfile.vendorUserId?.toString();
      if (currentVendor && currentVendor !== vendorUserId) {
        throw new ConflictError('Driver already belongs to another vendor');
      }

      existing.driverProfile.vendorUserId = new Types.ObjectId(vendorUserId);
      existing.driverProfile.fleetSource = 'vendor';
      if (dto.licenseNo) existing.driverProfile.licenseNo = dto.licenseNo;
      if (dto.driverType) existing.driverProfile.driverType = dto.driverType;
      if (dto.city) existing.driverProfile.city = dto.city;
      if (dto.vehicleRegistration) {
        existing.driverProfile.vehicleRegistration = dto.vehicleRegistration;
      }
      if (dto.name) existing.fullName = dto.name;
      if (process.env.NODE_ENV !== 'production') {
        existing.driverProfile.status = 'APPROVED';
        existing.isVerified = true;
        existing.isProfileCompleted = true;
      }
      await existing.save();
      return mapFleetDriver(existing);
    }

    const count = await driverRepository.count();
    const status = process.env.NODE_ENV === 'production' ? 'PENDING' : 'APPROVED';
    const created = await driverRepository.create({
      fullName: dto.name,
      mobileNumber: phone,
      email: dto.email,
      driverCode: `VDRV${String(count + 1).padStart(4, '0')}`,
      licenseNo: dto.licenseNo,
      driverType: dto.driverType,
      vendorUserId,
      fleetSource: 'vendor',
      city: dto.city ?? 'Bhubaneswar',
      state: 'Odisha',
      vehicleRegistration: dto.vehicleRegistration,
      status: status as 'PENDING' | 'APPROVED',
      isVerified: true,
      statusHistory: [{ status: status as 'PENDING' | 'APPROVED', changedAt: new Date() }],
    });

    await UserModel.findByIdAndUpdate(created.id, {
      isProfileCompleted: true,
      isAvailable: true,
      currentLocation: {
        latitude: 20.2961,
        longitude: 85.8245,
        updatedAt: new Date(),
      },
    }).exec();

    const user = await UserModel.findById(created.id).exec();
    if (!user) throw new NotFoundError('Driver not found after create');
    return mapFleetDriver(user);
  }

  async claimByPhone(vendorUserId: string, phoneRaw: string) {
    await this.assertVendorApproved(vendorUserId);
    const phone = normalizeMobileNumber(phoneRaw);
    const driver = await UserModel.findOne({ mobileNumber: phone, role: 'driver' }).exec();
    if (!driver?.driverProfile) {
      throw new NotFoundError('No driver found with this mobile number');
    }
    const currentVendor = driver.driverProfile.vendorUserId?.toString();
    if (currentVendor && currentVendor !== vendorUserId) {
      throw new ConflictError('Driver already belongs to another vendor');
    }
    driver.driverProfile.vendorUserId = new Types.ObjectId(vendorUserId);
    driver.driverProfile.fleetSource = 'vendor';
    await driver.save();
    return mapFleetDriver(driver);
  }

  async remove(vendorUserId: string, driverId: string) {
    await this.assertVendor(vendorUserId);
    const driver = await UserModel.findOne({ _id: driverId, role: 'driver' }).exec();
    if (!driver?.driverProfile) throw new NotFoundError('Driver not found');
    if (driver.driverProfile.vendorUserId?.toString() !== vendorUserId) {
      throw new ForbiddenError('Driver is not in your fleet');
    }
    if (driver.activeBookingId) {
      throw new BadRequestError('Cannot remove a driver with an active booking');
    }
    driver.driverProfile.vendorUserId = undefined;
    driver.driverProfile.fleetSource = undefined;
    await driver.save();
    return { removed: true, driverId };
  }

  async uploadDocument(
    vendorUserId: string,
    driverId: string,
    documentType: string,
    file: { buffer: Buffer; mimetype: string; originalname: string },
  ) {
    await this.assertVendorApproved(vendorUserId);

    const driver = await UserModel.findOne({ _id: driverId, role: 'driver' }).exec();
    if (!driver?.driverProfile) throw new NotFoundError('Driver not found');
    if (driver.driverProfile.vendorUserId?.toString() !== vendorUserId) {
      throw new ForbiddenError('Driver is not in your fleet');
    }

    const upload = await storageService.uploadDriverDocument({
      driverId,
      buffer: file.buffer,
      mimeType: file.mimetype,
      originalName: file.originalname,
      documentType,
    });

    const DOC_LABELS: Record<string, string> = {
      driving_license: 'Driving License',
      aadhaar: 'Aadhaar Card',
      police_verification: 'Police Verification',
      medical_certificate: 'Medical Fitness Certificate',
      medical: 'Medical Fitness Certificate',
    };
    const docLabel = DOC_LABELS[documentType] ?? documentType.replace(/_/g, ' ');

    if (!driver.driverProfile.documents?.length) {
      driver.driverProfile.documents = [];
    }

    const existingIndex = driver.driverProfile.documents.findIndex((d) => d.type === docLabel);
    if (existingIndex >= 0) {
      driver.driverProfile.documents[existingIndex].url = upload.fileUrl;
      driver.driverProfile.documents[existingIndex].status = 'PENDING';
      driver.driverProfile.documents[existingIndex].uploadedAt = new Date();
    } else {
      driver.driverProfile.documents.push({
        type: docLabel,
        url: upload.fileUrl,
        status: 'PENDING',
        uploadedAt: new Date(),
      });
    }

    // Keep driver pending until admin approves.
    driver.driverProfile.status = 'PENDING';
    await driver.save();

    return mapFleetDriver(driver);
  }
}

export const vendorDriversService = new VendorDriversService();
