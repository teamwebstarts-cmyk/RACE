import { Types } from 'mongoose';

import { ConflictError, ForbiddenError, NotFoundError } from '../../utils/src/errors';
import { VendorVehicleModel } from '../../models/src/vendorVehicle';
import { UserModel } from '../../models/src/user';
import type { CreateVendorVehicleDto, UpdateVendorVehicleDto } from './vendorVehiclesValidator';

function mapVehicle(doc: {
  _id: Types.ObjectId;
  vendorId: Types.ObjectId;
  registrationNo: string;
  type: string;
  vehicleModel: string;
  year?: number;
  status: string;
  insuranceExpiry?: Date;
  maintenanceNote?: string;
  createdAt?: Date;
  updatedAt?: Date;
}) {
  return {
    id: doc._id.toString(),
    vendorId: doc.vendorId.toString(),
    registrationNo: doc.registrationNo,
    type: doc.type,
    model: doc.vehicleModel,
    year: doc.year,
    status: doc.status,
    insuranceExpiry: doc.insuranceExpiry?.toISOString(),
    maintenanceNote: doc.maintenanceNote,
    createdAt: doc.createdAt?.toISOString(),
    updatedAt: doc.updatedAt?.toISOString(),
  };
}

function buildMaintenanceNote(dto: CreateVendorVehicleDto): string | undefined {
  const parts = [
    dto.rcNumber ? `RC: ${dto.rcNumber}` : null,
    dto.insuranceProvider ? `Insurer: ${dto.insuranceProvider}` : null,
    dto.insurancePolicyNumber ? `Policy: ${dto.insurancePolicyNumber}` : null,
  ].filter(Boolean);
  return parts.length ? parts.join(' · ') : undefined;
}

export class VendorVehiclesService {
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
        'Your vendor account must be approved by admin before you can register vehicles.',
      );
    }
    return user;
  }

  async list(vendorUserId: string) {
    await this.assertVendor(vendorUserId);
    const vehicles = await VendorVehicleModel.find({ vendorId: vendorUserId })
      .sort({ createdAt: -1 })
      .lean()
      .exec();
    return vehicles.map(mapVehicle);
  }

  async create(vendorUserId: string, dto: CreateVendorVehicleDto) {
    await this.assertVendorApproved(vendorUserId);
    const registrationNo = dto.registrationNo.trim().toUpperCase();

    const existing = await VendorVehicleModel.findOne({
      vendorId: vendorUserId,
      registrationNo,
    }).exec();
    if (existing) {
      throw new ConflictError('A vehicle with this registration number already exists in your fleet');
    }

    const vehicle = await VendorVehicleModel.create({
      vendorId: new Types.ObjectId(vendorUserId),
      registrationNo,
      type: dto.type,
      vehicleModel: dto.model,
      year: dto.year,
      status: dto.status ?? 'ACTIVE',
      insuranceExpiry: dto.insuranceExpiry ? new Date(dto.insuranceExpiry) : undefined,
      maintenanceNote: buildMaintenanceNote(dto),
    });

    return mapVehicle(vehicle);
  }

  async update(vendorUserId: string, vehicleId: string, dto: UpdateVendorVehicleDto) {
    await this.assertVendor(vendorUserId);
    const vehicle = await VendorVehicleModel.findById(vehicleId).exec();
    if (!vehicle) throw new NotFoundError('Vehicle not found');
    if (vehicle.vendorId.toString() !== vendorUserId) {
      throw new ForbiddenError('Vehicle is not in your fleet');
    }

    if (dto.type) vehicle.type = dto.type;
    if (dto.model) vehicle.vehicleModel = dto.model;
    if (dto.year !== undefined) vehicle.year = dto.year;
    if (dto.status) vehicle.status = dto.status;
    if (dto.insuranceExpiry) vehicle.insuranceExpiry = new Date(dto.insuranceExpiry);
    if (dto.maintenanceNote !== undefined) vehicle.maintenanceNote = dto.maintenanceNote;
    await vehicle.save();

    return mapVehicle(vehicle);
  }

  async remove(vendorUserId: string, vehicleId: string) {
    await this.assertVendor(vendorUserId);
    const vehicle = await VendorVehicleModel.findById(vehicleId).exec();
    if (!vehicle) throw new NotFoundError('Vehicle not found');
    if (vehicle.vendorId.toString() !== vendorUserId) {
      throw new ForbiddenError('Vehicle is not in your fleet');
    }
    await vehicle.deleteOne();
    return { removed: true, vehicleId };
  }
}

export const vendorVehiclesService = new VendorVehiclesService();
