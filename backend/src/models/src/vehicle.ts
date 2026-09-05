import { Schema, model, type Document, Types } from 'mongoose';

export type VehicleType = 'car' | 'bike' | 'ev' | 'truck' | 'auto' | 'bus' | 'other';
export type FuelType = 'petrol' | 'diesel' | 'cng' | 'electric' | 'hybrid' | 'other';

export interface IVehicle extends Document {
  customerId: Types.ObjectId;
  vehicleType: VehicleType;
  vehicleSubtype?: string;
  vehicleNumber: string;
  brand: string;
  vehicleModel: string;
  color?: string;
  fuelType: FuelType;
  qrCode: string;
  photo?: string;
  createdAt: Date;
  updatedAt: Date;
}

const VehicleSchema = new Schema<IVehicle>(
  {
    customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    vehicleType: {
      type: String,
      enum: ['car', 'bike', 'ev', 'truck', 'auto', 'bus', 'other'],
      required: true,
    },
    vehicleSubtype: { type: String, trim: true },
    vehicleNumber: { type: String, required: true, trim: true, uppercase: true },
    brand: { type: String, required: true, trim: true },
    vehicleModel: { type: String, required: true, trim: true },
    color: { type: String, trim: true },
    fuelType: {
      type: String,
      enum: ['petrol', 'diesel', 'cng', 'electric', 'hybrid', 'other'],
      required: true,
    },
    qrCode: { type: String, required: true },
    photo: { type: String },
  },
  { timestamps: true },
);

VehicleSchema.index({ customerId: 1, vehicleNumber: 1 }, { unique: true });

export const VehicleModel = model<IVehicle>('Vehicle', VehicleSchema);
