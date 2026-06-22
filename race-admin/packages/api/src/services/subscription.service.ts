import type {
  PaginatedResponse,
  SubscriptionListFilters,
  SubscriptionOverview,
  SubscriptionPlan,
} from '@race/types';
import { delay } from '@race/utils';
import { appConfig } from '@race/config';

import { filterPlans, SUBSCRIPTION_METRICS } from '../mocks/subscriptions.mock';

export async function getSubscriptionOverview(): Promise<SubscriptionOverview> {
  await delay(appConfig.mockApiDelayMs);
  return { metrics: SUBSCRIPTION_METRICS };
}

export async function getSubscriptionPlans(
  filters: SubscriptionListFilters = {},
): Promise<PaginatedResponse<SubscriptionPlan>> {
  await delay(appConfig.mockApiDelayMs);

  const tab = filters.tab ?? 'CUSTOMER';
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 10;
  const filtered = filterPlans(tab);
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;

  return {
    items: filtered.slice(start, start + pageSize),
    total,
    page,
    pageSize,
    totalPages,
  };
}
