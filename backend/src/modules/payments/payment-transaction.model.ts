import { Schema, model, type Document, Types } from 'mongoose';

export const BOOKING_PAYMENT_TYPES = ['towing', 'driver'] as const;
export type BookingPaymentType = (typeof BOOKING_PAYMENT_TYPES)[number];

export const PAYMENT_TRANSACTION_TYPES = ['advance', 'final', 'refund'] as const;
export type PaymentTransactionType = (typeof PAYMENT_TRANSACTION_TYPES)[number];

export const PAYMENT_TRANSACTION_STATUSES = ['initiated', 'success', 'failed'] as const;
export type PaymentTransactionStatus = (typeof PAYMENT_TRANSACTION_STATUSES)[number];

export interface IPaymentTransaction extends Document {
  bookingId: Types.ObjectId;
  bookingType: BookingPaymentType;
  customerId: Types.ObjectId;
  paymentType: PaymentTransactionType;
  amount: number;
  status: PaymentTransactionStatus;
  gatewayReferenceId?: string;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentTransactionSchema = new Schema<IPaymentTransaction>(
  {
    bookingId: { type: Schema.Types.ObjectId, required: true, index: true },
    bookingType: { type: String, enum: BOOKING_PAYMENT_TYPES, required: true, index: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    paymentType: { type: String, enum: PAYMENT_TRANSACTION_TYPES, required: true },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: PAYMENT_TRANSACTION_STATUSES,
      default: 'initiated',
      index: true,
    },
    gatewayReferenceId: { type: String },
    note: { type: String },
  },
  { timestamps: true },
);

PaymentTransactionSchema.index({ bookingId: 1, bookingType: 1, paymentType: 1 });

export const PaymentTransactionModel = model<IPaymentTransaction>(
  'PaymentTransaction',
  PaymentTransactionSchema,
);
