import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { SubscriptionPlan, SubscriptionPlanId } from '../../types/profile';

export interface SubscriptionsState {
  plans: SubscriptionPlan[];
  selectedPlanId: SubscriptionPlanId | null;
  billingPeriod: 'monthly' | 'yearly';
}

const initialState: SubscriptionsState = {
  plans: [],
  selectedPlanId: null,
  billingPeriod: 'monthly',
};

const subscriptionsSlice = createSlice({
  name: 'subscriptions',
  initialState,
  reducers: {
    setBillingPeriod(state, action: PayloadAction<'monthly' | 'yearly'>) {
      state.billingPeriod = action.payload;
    },
    setPlans(state, action: PayloadAction<SubscriptionPlan[]>) {
      state.plans = action.payload;
    },
    selectPlan(state, action: PayloadAction<SubscriptionPlanId | null>) {
      state.selectedPlanId = action.payload;
    },
    resetSubscriptions(state) {
      state.selectedPlanId = null;
      state.billingPeriod = 'monthly';
      state.plans = [];
    },
  },
});

export const { setBillingPeriod, setPlans, selectPlan, resetSubscriptions } =
  subscriptionsSlice.actions;

export default subscriptionsSlice.reducer;
