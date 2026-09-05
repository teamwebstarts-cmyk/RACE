import { Schema, model, type Document, Types } from 'mongoose';

export type TransactionType =
  | 'PAYMENT'
  | 'VENDOR_PAYOUT'
  | 'REFUND'
  | 'COMMISSION'
  | 'SUBSCRIPTION';

export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export interface ITransaction extends Document {
  transactionCode: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  currency: string;
  customerId?: Types.ObjectId;
  vendorId?: Types.ObjectId;
  driverId?: Types.ObjectId;
  bookingId?: Types.ObjectId;
  subscriptionId?: Types.ObjectId;
  description?: string;
  reference?: string;
  paymentMethod?: string;
  metadata?: Record<string, unknown>;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    transactionCode: { type: String, required: true, unique: true, index: true },
    type: {
      type: String,
      enum: ['PAYMENT', 'VENDOR_PAYOUT', 'REFUND', 'COMMISSION', 'SUBSCRIPTION'],
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'],
      default: 'COMPLETED',
      index: true,
    },
    amount: { type: Number, required: true, index: true },
    currency: { type: String, default: 'INR' },
    customerId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', index: true },
    driverId: { type: Schema.Types.ObjectId, ref: 'Driver', index: true },
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', index: true },
    subscriptionId: { type: Schema.Types.ObjectId, ref: 'UserSubscription', index: true },
    description: { type: String },
    reference: { type: String, index: true },
    paymentMethod: { type: String },
    metadata: { type: Schema.Types.Mixed },
    completedAt: { type: Date, index: true },
  },
  { timestamps: true },
);

TransactionSchema.index({ createdAt: -1 });

export const TransactionModel = model<ITransaction>('Transaction', TransactionSchema);
