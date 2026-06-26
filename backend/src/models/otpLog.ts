import { Schema, model, type Document } from 'mongoose';

export type OtpStatus = 'pending' | 'verified' | 'expired' | 'failed';

export interface IOtpLog extends Document {
  mobileNumber: string;
  otp: string;
  status: OtpStatus;
  expiresAt: Date;
  attempts: number;
  createdAt: Date;
  updatedAt: Date;
}

const OtpLogSchema = new Schema<IOtpLog>(
  {
    mobileNumber: { type: String, required: true, index: true },
    otp: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'verified', 'expired', 'failed'],
      default: 'pending',
    },
    expiresAt: { type: Date, required: true, index: true },
    attempts: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const OtpLogModel = model<IOtpLog>('OtpLog', OtpLogSchema);
