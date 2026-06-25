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
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'changes_requested';

export type VerificationStage =
  | 'submitted'
  | 'document_review'
  | 'background_check'
  | 'selfie_match'
  | 'approved'
  | 'rejected';

export interface IVendorBankDetails {
  accountHolderName: string;
  accountNumber: string;
  ifsc: string;
  bankName?: string;
}

export interface IVendorTowVehicle {
  registrationNumber: string;
  vehicleType: string;
  capacity?: string;
  photos?: string[];
}

export interface IVendorDriverProfile {
  dateOfBirth?: string;
  emergencyContact?: {
    name: string;
    mobileNumber: string;
    relationship?: string;
  };
  yearsOfExperience?: number;
  vehicleCategories?: string[];
  languages?: string[];
  previousEmployer?: string;
  referenceContact?: {
    name: string;
    mobileNumber: string;
  };
  availability?: {
    hourly?: boolean;
    daily?: boolean;
    nightShift?: boolean;
    weekend?: boolean;
  };
}

export interface IVendor extends Document {
  userId: Types.ObjectId;
  vendorType: VendorType;
  status: VendorStatus;
  verificationStage: VerificationStage;
  businessName?: string;
  ownerName?: string;
  mobileNumber: string;
  email?: string;
  address?: string;
  towVehicle?: IVendorTowVehicle;
  bankDetails?: IVendorBankDetails;
  driverProfile?: IVendorDriverProfile;
  reviewNotes?: string;
  documentReviews?: Array<{
    key: string;
    status: 'VERIFIED' | 'REJECTED' | 'PENDING';
    reviewedAt?: Date;
  }>;
  statusHistory: Array<{
    status: VendorStatus | VerificationStage;
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
      enum: ['draft', 'pending', 'under_review', 'approved', 'rejected', 'changes_requested'],
      default: 'draft',
    },
    verificationStage: {
      type: String,
      enum: [
        'submitted',
        'document_review',
        'background_check',
        'selfie_match',
        'approved',
        'rejected',
      ],
      default: 'submitted',
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
      bankName: String,
    },
    driverProfile: {
      dateOfBirth: String,
      emergencyContact: {
        name: String,
        mobileNumber: String,
        relationship: String,
      },
      yearsOfExperience: Number,
      vehicleCategories: [String],
      languages: [String],
      previousEmployer: String,
      referenceContact: {
        name: String,
        mobileNumber: String,
      },
      availability: {
        hourly: Boolean,
        daily: Boolean,
        nightShift: Boolean,
        weekend: Boolean,
      },
    },
    reviewNotes: { type: String },
    documentReviews: [
      {
        key: { type: String, required: true },
        status: { type: String, enum: ['VERIFIED', 'REJECTED', 'PENDING'], required: true },
        reviewedAt: { type: Date, default: Date.now },
      },
    ],
    statusHistory: [
      {
        status: { type: String, required: true },
        note: String,
        changedAt: { type: Date, default: Date.now },
      },
    ],
    submittedAt: { type: Date },
    approvedAt: { type: Date },
  },
  { timestamps: true },
);

VendorSchema.index({ status: 1, submittedAt: -1 });
VendorSchema.index({ verificationStage: 1 });

export const VendorModel = model<IVendor>('Vendor', VendorSchema);
