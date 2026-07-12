import { Schema, model, type Document, Types } from 'mongoose';

export type VendorVehicleStatus = 'ACTIVE' | 'UNDER_MAINTENANCE' | 'INACTIVE';

export interface IVendorVehicle extends Document {
  vendorId: Types.ObjectId;
  registrationNo: string;
  type: string;
  vehicleModel: string;
  year?: number;
  status: VendorVehicleStatus;
  insuranceExpiry?: Date;
  maintenanceNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

const VendorVehicleSchema = new Schema<IVendorVehicle>(
  {
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true, index: true },
    registrationNo: { type: String, required: true, trim: true, uppercase: true },
    type: { type: String, required: true },
    vehicleModel: { type: String, required: true },
    year: { type: Number },
    status: {
      type: String,
      enum: ['ACTIVE', 'UNDER_MAINTENANCE', 'INACTIVE'],
      default: 'ACTIVE',
      index: true,
    },
    insuranceExpiry: { type: Date },
    maintenanceNote: { type: String },
  },
  { timestamps: true },
);

VendorVehicleSchema.index({ vendorId: 1, registrationNo: 1 }, { unique: true });

export const VendorVehicleModel = model<IVendorVehicle>('VendorVehicle', VendorVehicleSchema);
