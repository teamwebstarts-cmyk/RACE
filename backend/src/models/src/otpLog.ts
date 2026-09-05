import { Schema, model, type Document } from 'mongoose';

export interface IOtpLog extends Document {
  mobileNumber: string;
  email?: string;
  fullName?: string;
  mobileOtp?: string;
  emailOtp?: string;
  mobileOtpExpiry?: Date;
  emailOtpExpiry?: Date;
  mobileVerified: boolean;
  emailVerified: boolean;
  mobileAttempts: number;
  emailAttempts: number;
  createdAt: Date;
}

const OtpLogSchema = new Schema<IOtpLog>(
  {
    mobileNumber: { type: String, required: true, index: true },
    email: { type: String, index: true, sparse: true },
    fullName: { type: String, trim: true },
    mobileOtp: { type: String },
    emailOtp: { type: String },
    mobileOtpExpiry: { type: Date },
    emailOtpExpiry: { type: Date },
    mobileVerified: { type: Boolean, default: false },
    emailVerified: { type: Boolean, default: false },
    mobileAttempts: { type: Number, default: 0 },
    emailAttempts: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: false },
);

export const OtpLogModel = model<IOtpLog>('OtpLog', OtpLogSchema);
