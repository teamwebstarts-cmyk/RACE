import type {
  PaginatedResponse,
  SubscriptionListFilters,
  SubscriptionOverview,
  SubscriptionPlan,
} from '@race/types';

import { apiGet } from '../http';

export async function getSubscriptionOverview(): Promise<SubscriptionOverview> {
  return apiGet<SubscriptionOverview>('/subscriptions/overview');
}

export async function getSubscriptionPlans(
  filters: SubscriptionListFilters = {},
): Promise<PaginatedResponse<SubscriptionPlan>> {
  return apiGet<PaginatedResponse<SubscriptionPlan>>('/subscriptions/plans', filters as Record<string, unknown>);
}
