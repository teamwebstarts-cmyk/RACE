import { Schema, model, type Document, Types } from 'mongoose';

export interface IWallet extends Document {
  userId: Types.ObjectId;
  balance: number;
  currency: string;
  lastTopUpAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const WalletSchema = new Schema<IWallet>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    balance: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' },
    lastTopUpAt: { type: Date },
  },
  { timestamps: true },
);

export const WalletModel = model<IWallet>('Wallet', WalletSchema);
