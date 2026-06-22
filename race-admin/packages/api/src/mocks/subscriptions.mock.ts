import type { SubscriptionMetric, SubscriptionPlan, SubscriptionPlanTab } from '@race/types';

export const SUBSCRIPTION_METRICS: SubscriptionMetric[] = [
  { id: 'active', label: 'Total Active Subscriptions', value: '1,245', icon: 'CreditCard' },
  { id: 'expiring', label: 'Expiring This Month', value: 87, icon: 'Hourglass' },
  { id: 'revenue', label: 'Avg. Revenue', value: '₹8,75,600', icon: 'IndianRupee' },
];

const CUSTOMER_PLANS: Omit<SubscriptionPlan, 'tab'>[] = [
  {
    id: 'plan_c1',
    planName: 'Basic Plan',
    type: 'Customer',
    activeSubscriptions: 456,
    price: 499,
    priceLabel: '₹499/Month',
    revenue: 228744,
    status: 'ACTIVE',
  },
  {
    id: 'plan_c2',
    planName: 'Premium Plan',
    type: 'Customer',
    activeSubscriptions: 312,
    price: 999,
    priceLabel: '₹999/Month',
    revenue: 311688,
    status: 'ACTIVE',
  },
  {
    id: 'plan_c3',
    planName: 'Family Plan',
    type: 'Customer',
    activeSubscriptions: 277,
    price: 1499,
    priceLabel: '₹1,499/Month',
    revenue: 414723,
    status: 'ACTIVE',
  },
  {
    id: 'plan_c4',
    planName: 'Gold Annual',
    type: 'Customer',
    activeSubscriptions: 200,
    price: 1499,
    priceLabel: '₹1,499/Year',
    revenue: 299800,
    status: 'ACTIVE',
  },
];

const VENDOR_PLANS: Omit<SubscriptionPlan, 'tab'>[] = [
  {
    id: 'plan_v1',
    planName: 'Reduced Commission',
    type: 'Vendor',
    activeSubscriptions: 186,
    price: 1999,
    priceLabel: '₹1,999/Month',
    revenue: 371814,
    status: 'ACTIVE',
  },
  {
    id: 'plan_v2',
    planName: 'Priority Leads',
    type: 'Vendor',
    activeSubscriptions: 14,
    price: 2999,
    priceLabel: '₹2,999/Month',
    revenue: 41986,
    status: 'ACTIVE',
  },
  {
    id: 'plan_v3',
    planName: 'Fleet Pro',
    type: 'Vendor',
    activeSubscriptions: 42,
    price: 4999,
    priceLabel: '₹4,999/Month',
    revenue: 209958,
    status: 'ACTIVE',
  },
];

export const MOCK_PLANS: SubscriptionPlan[] = [
  ...CUSTOMER_PLANS.map((p) => ({ ...p, tab: 'CUSTOMER' as SubscriptionPlanTab })),
  ...VENDOR_PLANS.map((p) => ({ ...p, tab: 'VENDOR' as SubscriptionPlanTab })),
];

export function filterPlans(tab: SubscriptionPlanTab): SubscriptionPlan[] {
  return MOCK_PLANS.filter((p) => p.tab === tab);
}
