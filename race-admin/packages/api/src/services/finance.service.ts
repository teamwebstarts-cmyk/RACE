import type {
  FinancialListFilters,
  FinancialOverview,
  FinancialTransaction,
  PaginatedResponse,
} from '@race/types';
import { delay } from '@race/utils';
import { appConfig } from '@race/config';

import {
  filterTransactions,
  FINANCIAL_METRICS,
  MOCK_TRANSACTIONS,
} from '../mocks/financial.mock';

export async function getFinancialOverview(): Promise<FinancialOverview> {
  await delay(appConfig.mockApiDelayMs);
  return { metrics: FINANCIAL_METRICS };
}

export async function getFinancialTransactions(
  filters: FinancialListFilters = {},
): Promise<PaginatedResponse<FinancialTransaction>> {
  await delay(appConfig.mockApiDelayMs);

  const tab = filters.tab ?? 'PAYMENTS';
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 10;
  const filtered = filterTransactions(
    MOCK_TRANSACTIONS,
    tab,
    filters.search,
    filters.status,
    filters.dateFrom,
    filters.dateTo,
  );
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

export async function exportFinancialTransactions(
  filters: FinancialListFilters = {},
): Promise<FinancialTransaction[]> {
  await delay(300);
  const tab = filters.tab ?? 'PAYMENTS';
  return filterTransactions(
    MOCK_TRANSACTIONS,
    tab,
    filters.search,
    filters.status,
    filters.dateFrom,
    filters.dateTo,
  );
}
