import type {
  FinancialListFilters,
  FinancialOverview,
  FinancialTransaction,
  PaginatedResponse,
} from '@race/types';

import { apiGet } from '../http';

const TAB_TYPE_MAP: Record<string, string> = {
  PAYMENTS: 'PAYMENT',
  VENDOR_PAYOUTS: 'VENDOR_PAYOUT',
  COMMISSIONS: 'COMMISSION',
  REFUNDS: 'REFUND',
  SUBSCRIPTION_REVENUE: 'SUBSCRIPTION',
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

export async function getFinancialOverview(): Promise<FinancialOverview> {
  const summary = await apiGet<{
    totalRevenue: number;
    totalCommission: number;
    totalRefunds: number;
    totalPayouts: number;
    pendingPayouts?: number;
  }>('/transactions/summary');

  return {
    metrics: [
      { id: 'revenue', label: 'Total Revenue', value: formatCurrency(summary.totalRevenue), icon: 'Wallet' },
      { id: 'commissions', label: 'Total Commissions', value: formatCurrency(summary.totalCommission), icon: 'Percent' },
      { id: 'refunds', label: 'Total Refunds', value: formatCurrency(summary.totalRefunds), icon: 'RotateCcw' },
      { id: 'payouts', label: 'Vendor Payouts', value: formatCurrency(summary.totalPayouts), icon: 'ArrowLeftRight' },
    ],
  };
}

export async function getFinancialTransactions(
  filters: FinancialListFilters = {},
): Promise<PaginatedResponse<FinancialTransaction>> {
  const type = filters.tab ? TAB_TYPE_MAP[filters.tab] : undefined;
  const result = await apiGet<PaginatedResponse<{
    id: string;
    transactionId: string;
    type: string;
    status: string;
    amount: number;
    from: string;
    to: string;
    date: string;
  }>>('/transactions', {
    ...filters,
    type: type ?? filters.status,
  });

  return {
    ...result,
    items: result.items.map((item) => ({
      id: item.id,
      transactionId: item.transactionId,
      type: item.type.replace('VENDOR_PAYOUT', 'PAYOUT') as FinancialTransaction['type'],
      from: item.from,
      to: item.to,
      amount: item.amount,
      status: item.status,
      date: item.date,
      tab: filters.tab ?? 'PAYMENTS',
    })),
  };
}

export async function exportFinancialTransactions(filters: FinancialListFilters = {}) {
  const result = await getFinancialTransactions({ ...filters, page: 1, pageSize: 10000 });
  return result.items;
}
