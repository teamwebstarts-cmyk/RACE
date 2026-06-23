import { Schema, model, type Document, Types } from 'mongoose';

export type DriverStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

export interface IDriver extends Document {
  driverCode: string;
  name: string;
  phone: string;
  email?: string;
  licenseNo: string;
  driverType: string;
  vendorId?: Types.ObjectId;
  city: string;
  state?: string;
  vehicleRegistration?: string;
  rating: number;
  reviewCount: number;
  status: DriverStatus;
  totalTrips: number;
  documents: Array<{
    type: string;
    url: string;
    status: 'PENDING' | 'VERIFIED' | 'REJECTED';
    uploadedAt: Date;
  }>;
  statusHistory: Array<{
    status: DriverStatus;
    note?: string;
    changedAt: Date;
    changedBy?: Types.ObjectId;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const DriverSchema = new Schema<IDriver>(
  {
    driverCode: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true, index: true },
    phone: { type: String, required: true, index: true },
    email: { type: String, trim: true, lowercase: true },
    licenseNo: { type: String, required: true, unique: true },
    driverType: { type: String, required: true },
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', index: true },
    city: { type: String, required: true, index: true },
    state: { type: String, default: 'Odisha' },
    vehicleRegistration: { type: String },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'],
      default: 'PENDING',
      index: true,
    },
    totalTrips: { type: Number, default: 0 },
    documents: [
      {
        type: { type: String, required: true },
        url: { type: String, required: true },
        status: { type: String, enum: ['PENDING', 'VERIFIED', 'REJECTED'], default: 'PENDING' },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    statusHistory: [
      {
        status: { type: String, required: true },
        note: { type: String },
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: Schema.Types.ObjectId, ref: 'Admin' },
      },
    ],
  },
  { timestamps: true },
);

DriverSchema.index({ name: 'text', phone: 'text', driverCode: 'text', licenseNo: 'text' });

export const DriverModel = model<IDriver>('Driver', DriverSchema);
