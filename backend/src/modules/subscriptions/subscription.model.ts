import { Schema, model, type Document, Types } from 'mongoose';

export type SubscriptionCategory = 'towing' | 'driver';
export type BillingCycle = 'monthly' | 'yearly';
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired';

export interface ISubscriptionPlan extends Document {
  slug: string;
  name: string;
  category: SubscriptionCategory;
  price: number;
  currency: string;
  billingCycle: BillingCycle;
  features: { text: string; included: boolean }[];
  isMostPopular: boolean;
  actionType: 'purchase' | 'contact';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserSubscription extends Document {
  userId: Types.ObjectId;
  planId: Types.ObjectId;
  planSlug: string;
  planName: string;
  category: SubscriptionCategory;
  billingCycle: BillingCycle;
  price: number;
  currency: string;
  status: SubscriptionStatus;
  startedAt: Date;
  expiresAt: Date;
  cancelledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PlanFeatureSchema = new Schema(
  { text: { type: String, required: true }, included: { type: Boolean, required: true } },
  { _id: false },
);

const SubscriptionPlanSchema = new Schema<ISubscriptionPlan>(
  {
    slug: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    category: { type: String, enum: ['towing', 'driver'], required: true },
    price: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    billingCycle: { type: String, enum: ['monthly', 'yearly'], required: true },
    features: { type: [PlanFeatureSchema], default: [] },
    isMostPopular: { type: Boolean, default: false },
    actionType: { type: String, enum: ['purchase', 'contact'], default: 'purchase' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const UserSubscriptionSchema = new Schema<IUserSubscription>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    planId: { type: Schema.Types.ObjectId, ref: 'SubscriptionPlan', required: true },
    planSlug: { type: String, required: true },
    planName: { type: String, required: true },
    category: { type: String, enum: ['towing', 'driver'], required: true },
    billingCycle: { type: String, enum: ['monthly', 'yearly'], required: true },
    price: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    status: { type: String, enum: ['active', 'cancelled', 'expired'], default: 'active' },
    startedAt: { type: Date, required: true },
    expiresAt: { type: Date, required: true },
    cancelledAt: { type: Date },
  },
  { timestamps: true },
);

export const SubscriptionPlanModel = model<ISubscriptionPlan>(
  'SubscriptionPlan',
  SubscriptionPlanSchema,
);
export const UserSubscriptionModel = model<IUserSubscription>(
  'UserSubscription',
  UserSubscriptionSchema,
);
