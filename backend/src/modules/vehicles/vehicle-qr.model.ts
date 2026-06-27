import { Schema, model, type Document, Types } from 'mongoose';

export interface IVehicleQrCode extends Document {
  vehicleId: Types.ObjectId;
  customerId: Types.ObjectId;
  payloadUrl: string;
  qrImageDataUrl: string;
  isActive: boolean;
  scanCount: number;
  lastScannedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const VehicleQrCodeSchema = new Schema<IVehicleQrCode>(
  {
    vehicleId: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true, unique: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    payloadUrl: { type: String, required: true },
    qrImageDataUrl: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    scanCount: { type: Number, default: 0 },
    lastScannedAt: { type: Date },
  },
  { timestamps: true },
);

export const VehicleQrCodeModel = model<IVehicleQrCode>('VehicleQrCode', VehicleQrCodeSchema);
