import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAppDispatch } from '../../redux/hooks';
import { setSubscription } from '../../redux/profile/profileSlice';
import { setPlans, setBillingPeriod } from '../../redux/subscriptions/subscriptionsSlice';
import {
  listSubscriptionPlans,
  getCurrentSubscription,
  subscribeToPlan,
  cancelSubscription,
} from './subscriptionApi';

export const subscriptionKeys = {
  plans: (period: string) => ['subscriptions', 'plans', period] as const,
  current: ['subscriptions', 'current'] as const,
};

export function useSubscriptionPlansQuery(billingPeriod: 'monthly' | 'yearly') {
  const dispatch = useAppDispatch();
  return useQuery({
    queryKey: subscriptionKeys.plans(billingPeriod),
    queryFn: async () => {
      const plans = await listSubscriptionPlans(billingPeriod);
      dispatch(setPlans(plans));
      return plans;
    },
  });
}

export function useCurrentSubscriptionQuery() {
  const dispatch = useAppDispatch();
  return useQuery({
    queryKey: subscriptionKeys.current,
    queryFn: async () => {
      const sub = await getCurrentSubscription();
      if (sub) {
        dispatch(setSubscription(sub));
      }
      return sub;
    },
  });
}

export function useSubscribeMutation() {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  return useMutation({
    mutationFn: (params: { planSlug: string; billingCycle?: 'monthly' | 'yearly' }) =>
      subscribeToPlan(params.planSlug, params.billingCycle),
    onSuccess: (sub) => {
      dispatch(setSubscription(sub));
      void queryClient.invalidateQueries({ queryKey: subscriptionKeys.current });
    },
  });
}

export function useCancelSubscriptionMutation() {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  return useMutation({
    mutationFn: cancelSubscription,
    onSuccess: (sub) => {
      dispatch(setSubscription(sub));
      void queryClient.invalidateQueries({ queryKey: subscriptionKeys.current });
    },
  });
}

export function useSetBillingPeriod(billingPeriod: 'monthly' | 'yearly') {
  const dispatch = useAppDispatch();
  dispatch(setBillingPeriod(billingPeriod));
}
