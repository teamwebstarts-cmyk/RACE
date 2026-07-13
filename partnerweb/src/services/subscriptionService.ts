import { API_ENDPOINTS } from '../config/api';
import { api, unwrapApi } from './api';

export type SubscriptionAudience = 'customer' | 'vendor';
export type SubscriptionCategory = 'towing' | 'driver' | 'partner';
export type BillingCycle = 'monthly' | 'yearly';
export type PlanActionType = 'purchase' | 'contact';

export type PlanFeature = {
  text: string;
  included: boolean;
};

export type VendorPlanBenefits = {
  commissionRate?: number;
  priorityLeads: boolean;
  featuredListing: boolean;
  performanceBadge: boolean;
  reducedCommission: boolean;
};

export type SubscriptionPlan = {
  id: string;
  slug: string;
  name: string;
  audience: SubscriptionAudience | string;
  category: SubscriptionCategory | string;
  price: number;
  currency: string;
  billingCycle: BillingCycle | string;
  features: PlanFeature[];
  benefits?: VendorPlanBenefits;
  isMostPopular: boolean;
  actionType: PlanActionType | string;
};

export type UserSubscription = {
  id: string;
  planSlug: string;
  planName: string;
  audience: SubscriptionAudience | string;
  category: SubscriptionCategory | string;
  billingCycle: BillingCycle | string;
  price: number;
  currency: string;
  status: string;
  startedAt: string;
  expiresAt: string;
};

export async function listPlans(
  audience: SubscriptionAudience = 'vendor',
  category?: SubscriptionCategory,
): Promise<SubscriptionPlan[]> {
  return unwrapApi(
    api.get(API_ENDPOINTS.subscriptionPlans, {
      params: { audience, ...(category ? { category } : {}) },
    }),
  );
}

export async function getCurrent(params?: {
  audience?: SubscriptionAudience;
  category?: SubscriptionCategory;
}): Promise<UserSubscription | null> {
  return unwrapApi(
    api.get(API_ENDPOINTS.subscriptionCurrent, { params }),
  );
}

export async function listMine(): Promise<UserSubscription[]> {
  return unwrapApi(
    api.get(API_ENDPOINTS.subscriptionCurrent, { params: { all: '1' } }),
  );
}

export async function subscribe(
  planSlug: string,
  billingCycle?: BillingCycle,
): Promise<UserSubscription> {
  return unwrapApi(
    api.post(API_ENDPOINTS.subscriptionCurrent, {
      planSlug,
      ...(billingCycle ? { billingCycle } : {}),
    }),
  );
}

export async function cancel(
  category?: SubscriptionCategory,
): Promise<UserSubscription> {
  return unwrapApi(
    api.post(API_ENDPOINTS.subscriptionCancel, {
      ...(category ? { category } : {}),
    }),
  );
}
