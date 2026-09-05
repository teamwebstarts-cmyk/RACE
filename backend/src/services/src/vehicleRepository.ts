import { VehicleModel, type IVehicle } from '../../models/src/vehicle';
import type { Types } from 'mongoose';

export class VehicleRepository {
  async create(data: Partial<IVehicle>): Promise<IVehicle> {
    return VehicleModel.create(data);
  }

  async findByCustomer(customerId: string | Types.ObjectId): Promise<IVehicle[]> {
    return VehicleModel.find({ customerId }).sort({ createdAt: -1 }).exec();
  }

  async findById(id: string): Promise<IVehicle | null> {
    return VehicleModel.findById(id).exec();
  }

  async findAll(): Promise<IVehicle[]> {
    return VehicleModel.find().exec();
  }

  async findByIdForCustomer(id: string, customerId: string): Promise<IVehicle | null> {
    return VehicleModel.findOne({ _id: id, customerId }).exec();
  }

  async updateByIdForCustomer(
    id: string,
    customerId: string,
    data: Partial<IVehicle>,
  ): Promise<IVehicle | null> {
    return VehicleModel.findOneAndUpdate({ _id: id, customerId }, data, {
      new: true,
      runValidators: true,
    }).exec();
  }

  async deleteByIdForCustomer(id: string, customerId: string): Promise<IVehicle | null> {
    return VehicleModel.findOneAndDelete({ _id: id, customerId }).exec();
  }
}

export const vehicleRepository = new VehicleRepository();
