import { NotFoundError } from '../../shared/utils/errors';
import { generateVehicleQrCode } from '../../shared/utils/qrCode';
import { vehicleRepository } from './vehicle.repository';
import type { IVehicle } from './vehicle.model';
import type {
  CreateVehicleDto,
  UpdateVehicleDto,
  VehicleResponseDto,
} from './vehicle.validator';

function mapVehicle(vehicle: IVehicle): VehicleResponseDto {
  return {
    id: vehicle.id,
    customerId: vehicle.customerId.toString(),
    vehicleType: vehicle.vehicleType,
    vehicleNumber: vehicle.vehicleNumber,
    brand: vehicle.brand,
    model: vehicle.vehicleModel,
    color: vehicle.color,
    fuelType: vehicle.fuelType,
    qrCode: vehicle.qrCode,
    photo: vehicle.photo,
    createdAt: vehicle.createdAt.toISOString(),
    updatedAt: vehicle.updatedAt.toISOString(),
  };
}

export class VehicleService {
  async createVehicle(customerId: string, dto: CreateVehicleDto): Promise<VehicleResponseDto> {
    const vehicle = await vehicleRepository.create({
      customerId: customerId as unknown as IVehicle['customerId'],
      vehicleType: dto.vehicleType,
      vehicleNumber: dto.vehicleNumber.toUpperCase(),
      brand: dto.brand,
      vehicleModel: dto.model,
      color: dto.color,
      fuelType: dto.fuelType,
      photo: dto.photo,
      qrCode: 'pending',
    });

    const qrCode = await generateVehicleQrCode(vehicle.id);
    vehicle.qrCode = qrCode;
    await vehicle.save();

    return mapVehicle(vehicle);
  }

  async listVehicles(customerId: string): Promise<VehicleResponseDto[]> {
    const vehicles = await vehicleRepository.findByCustomer(customerId);
    return vehicles.map(mapVehicle);
  }

  async getVehicle(customerId: string, vehicleId: string): Promise<VehicleResponseDto> {
    const vehicle = await vehicleRepository.findByIdForCustomer(vehicleId, customerId);
    if (!vehicle) {
      throw new NotFoundError('Vehicle not found');
    }
    return mapVehicle(vehicle);
  }

  async updateVehicle(
    customerId: string,
    vehicleId: string,
    dto: UpdateVehicleDto,
  ): Promise<VehicleResponseDto> {
    const vehicle = await vehicleRepository.updateByIdForCustomer(vehicleId, customerId, {
      vehicleType: dto.vehicleType,
      vehicleNumber: dto.vehicleNumber?.toUpperCase(),
      brand: dto.brand,
      vehicleModel: dto.model,
      color: dto.color,
      fuelType: dto.fuelType,
      photo: dto.photo,
    });

    if (!vehicle) {
      throw new NotFoundError('Vehicle not found');
    }

    return mapVehicle(vehicle);
  }

  async deleteVehicle(customerId: string, vehicleId: string): Promise<void> {
    const vehicle = await vehicleRepository.deleteByIdForCustomer(vehicleId, customerId);
    if (!vehicle) {
      throw new NotFoundError('Vehicle not found');
    }
  }

  async verifyVehicleQr(vehicleId: string) {
    const vehicle = await vehicleRepository.findById(vehicleId);
    if (!vehicle) {
      return { valid: false as const, vehicleId };
    }

    return {
      valid: true as const,
      vehicleId,
      vehicleNumber: vehicle.vehicleNumber,
      brand: vehicle.brand,
      model: vehicle.vehicleModel,
      vehicleType: vehicle.vehicleType,
      fuelType: vehicle.fuelType,
      color: vehicle.color,
    };
  }

  async regenerateAllQrCodes(): Promise<number> {
    const vehicles = await vehicleRepository.findAll();
    let updated = 0;

    for (const vehicle of vehicles) {
      vehicle.qrCode = await generateVehicleQrCode(vehicle.id);
      await vehicle.save();
      updated += 1;
    }

    return updated;
  }
}

export const vehicleService = new VehicleService();
