import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { SubscriptionPlan, SubscriptionPlanId } from '../../types/profile';

export interface SubscriptionsState {
  plans: SubscriptionPlan[];
  selectedPlanId: SubscriptionPlanId | null;
  billingPeriod: 'monthly' | 'yearly';
}

const monthlyPlans: SubscriptionPlan[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 299,
    period: 'monthly',
    features: [
      { label: '2 towing requests / month', included: true },
      { label: '30 min avg response', included: true },
      { label: 'Standard support', included: true },
      { label: 'Priority dispatch', included: false },
      { label: 'Free roadside assistance', included: false },
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 599,
    period: 'monthly',
    popular: true,
    features: [
      { label: '5 towing requests / month', included: true },
      { label: '15 min avg response', included: true },
      { label: '24/7 priority support', included: true },
      { label: 'Free roadside assistance', included: true },
      { label: 'Family coverage', included: false },
    ],
  },
  {
    id: 'family',
    name: 'Family',
    price: 999,
    period: 'monthly',
    features: [
      { label: 'Unlimited requests', included: true },
      { label: '10 min avg response', included: true },
      { label: '24/7 VIP support', included: true },
      { label: 'Free roadside assistance', included: true },
      { label: 'Up to 4 vehicles', included: true },
    ],
  },
];

const initialState: SubscriptionsState = {
  plans: monthlyPlans,
  selectedPlanId: null,
  billingPeriod: 'monthly',
};

const subscriptionsSlice = createSlice({
  name: 'subscriptions',
  initialState,
  reducers: {
    setBillingPeriod(state, action: PayloadAction<'monthly' | 'yearly'>) {
      state.billingPeriod = action.payload;
      const multiplier = action.payload === 'yearly' ? 0.8 : 1;
      state.plans = monthlyPlans.map((plan) => ({
        ...plan,
        period: action.payload,
        price: Math.round(plan.price * (action.payload === 'yearly' ? 12 * multiplier : 1)),
      }));
    },
    selectPlan(state, action: PayloadAction<SubscriptionPlanId | null>) {
      state.selectedPlanId = action.payload;
    },
    resetSubscriptions(state) {
      state.selectedPlanId = null;
      state.billingPeriod = 'monthly';
      state.plans = monthlyPlans;
    },
  },
});

export const { setBillingPeriod, selectPlan, resetSubscriptions } = subscriptionsSlice.actions;

export default subscriptionsSlice.reducer;
