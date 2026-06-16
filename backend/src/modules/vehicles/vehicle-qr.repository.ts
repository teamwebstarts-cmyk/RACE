import { VehicleQrCodeModel } from './vehicle-qr.model';

export class VehicleQrRepository {
  async upsertForVehicle(data: {
    vehicleId: string;
    customerId: string;
    payloadUrl: string;
    qrImageDataUrl: string;
  }) {
    return VehicleQrCodeModel.findOneAndUpdate(
      { vehicleId: data.vehicleId },
      {
        vehicleId: data.vehicleId,
        customerId: data.customerId,
        payloadUrl: data.payloadUrl,
        qrImageDataUrl: data.qrImageDataUrl,
        isActive: true,
      },
      { upsert: true, new: true },
    ).exec();
  }

  async recordScan(vehicleId: string) {
    return VehicleQrCodeModel.findOneAndUpdate(
      { vehicleId },
      { $inc: { scanCount: 1 }, lastScannedAt: new Date() },
      { new: true },
    ).exec();
  }

  async findByVehicleId(vehicleId: string) {
    return VehicleQrCodeModel.findOne({ vehicleId }).exec();
  }
}

export const vehicleQrRepository = new VehicleQrRepository();
