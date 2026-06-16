import { Schema, model, type Document, Types } from 'mongoose';

export type VendorType =
  | 'towing_company'
  | 'tow_truck_driver'
  | 'full_time_driver'
  | 'part_time_driver'
  | 'mechanic';

export type VendorStatus =
  | 'draft'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'changes_requested';

export interface IVendorBankDetails {
  accountHolderName: string;
  accountNumber: string;
  ifsc: string;
}

export interface IVendorTowVehicle {
  registrationNumber: string;
  vehicleType: string;
  capacity?: string;
  photos?: string[];
}

export interface IVendor extends Document {
  userId: Types.ObjectId;
  vendorType: VendorType;
  status: VendorStatus;
  businessName?: string;
  ownerName?: string;
  mobileNumber: string;
  email?: string;
  address?: string;
  towVehicle?: IVendorTowVehicle;
  bankDetails?: IVendorBankDetails;
  reviewNotes?: string;
  statusHistory: Array<{
    status: VendorStatus;
    note?: string;
    changedAt: Date;
  }>;
  submittedAt?: Date;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const VendorSchema = new Schema<IVendor>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    vendorType: {
      type: String,
      enum: [
        'towing_company',
        'tow_truck_driver',
        'full_time_driver',
        'part_time_driver',
        'mechanic',
      ],
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'pending', 'approved', 'rejected', 'changes_requested'],
      default: 'draft',
    },
    businessName: { type: String, trim: true },
    ownerName: { type: String, trim: true },
    mobileNumber: { type: String, required: true },
    email: { type: String, trim: true, lowercase: true },
    address: { type: String, trim: true },
    towVehicle: {
      registrationNumber: String,
      vehicleType: String,
      capacity: String,
      photos: [String],
    },
    bankDetails: {
      accountHolderName: String,
      accountNumber: String,
      ifsc: String,
    },
    reviewNotes: { type: String },
    statusHistory: [
      {
        status: {
          type: String,
          enum: ['draft', 'pending', 'approved', 'rejected', 'changes_requested'],
          required: true,
        },
        note: String,
        changedAt: { type: Date, default: Date.now },
      },
    ],
    submittedAt: { type: Date },
    approvedAt: { type: Date },
  },
  { timestamps: true },
);

export const VendorModel = model<IVendor>('Vendor', VendorSchema);
