import { Schema, model, type Document, Types } from 'mongoose';

export type PaymentMethodType = 'upi' | 'card' | 'wallet' | 'netbanking';

export interface IPaymentMethod extends Document {
  userId: Types.ObjectId;
  type: PaymentMethodType;
  label: string;
  details: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentMethodSchema = new Schema<IPaymentMethod>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['upi', 'card', 'wallet', 'netbanking'], required: true },
    label: { type: String, required: true },
    details: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const PaymentMethodModel = model<IPaymentMethod>('PaymentMethod', PaymentMethodSchema);
