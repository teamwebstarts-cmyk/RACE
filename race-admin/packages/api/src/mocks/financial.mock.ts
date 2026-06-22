import type { FinancialMetric, FinancialTab, FinancialTransaction } from '@race/types';

export const FINANCIAL_METRICS: FinancialMetric[] = [
  {
    id: 'revenue',
    label: 'Total Revenue',
    value: '₹18,45,300',
    trend: { value: '15.6%', direction: 'up', label: 'vs last month' },
    icon: 'Wallet',
  },
  {
    id: 'transactions',
    label: 'Total Transactions',
    value: '2,456',
    trend: { value: '4.3%', direction: 'up', label: 'vs last month' },
    icon: 'ArrowLeftRight',
  },
  {
    id: 'commissions',
    label: 'Total Commissions',
    value: '₹2,45,850',
    trend: { value: '11.5%', direction: 'up', label: 'vs last month' },
    icon: 'Percent',
  },
  {
    id: 'refunds',
    label: 'Total Refunds',
    value: '₹86,750',
    trend: { value: '3.2%', direction: 'down', label: 'vs last month' },
    icon: 'RotateCcw',
  },
];

const TAB_TYPE_MAP: Record<FinancialTab, FinancialTransaction['type'][]> = {
  PAYMENTS: ['PAYMENT'],
  VENDOR_PAYOUTS: ['PAYOUT'],
  COMMISSIONS: ['COMMISSION'],
  REFUNDS: ['REFUND'],
  SUBSCRIPTION_REVENUE: ['SUBSCRIPTION'],
};

function makeTransaction(index: number, tab: FinancialTab): FinancialTransaction {
  const types = TAB_TYPE_MAP[tab];
  const type = types[0];
  const customers = ['Rahul Sharma', 'Priya Patel', 'Amit Kumar', 'Sneha Das'];
  const vendors = ['RACE Towing Pvt Ltd', 'Speed Tow Pvt Ltd', 'QuickFix Roadside'];
  const statuses = ['COMPLETED', 'COMPLETED', 'COMPLETED', 'PENDING'];

  const fromMap: Record<FinancialTransaction['type'], string> = {
    PAYMENT: customers[index % customers.length],
    PAYOUT: 'RACE Service',
    COMMISSION: vendors[index % vendors.length],
    REFUND: 'RACE Service',
    SUBSCRIPTION: customers[index % customers.length],
  };

  const toMap: Record<FinancialTransaction['type'], string> = {
    PAYMENT: 'RACE Service',
    PAYOUT: vendors[index % vendors.length],
    COMMISSION: 'RACE Service',
    REFUND: customers[index % customers.length],
    SUBSCRIPTION: 'RACE Service',
  };

  return {
    id: `txn_${tab}_${index}`,
    transactionId: `TXN${String(7000 + index)}${String.fromCharCode(65 + (index % 26))}`,
    type,
    from: fromMap[type],
    to: toMap[type],
    amount: 499 + (index % 20) * 250,
    status: statuses[index % statuses.length],
    date: new Date(2025, 5, (index % 28) + 1, 8 + (index % 12), (index % 4) * 15).toISOString(),
    tab,
  };
}

export const MOCK_TRANSACTIONS: FinancialTransaction[] = (
  Object.keys(TAB_TYPE_MAP) as FinancialTab[]
).flatMap((tab) => Array.from({ length: 120 }, (_, i) => makeTransaction(i, tab)));

export function filterTransactions(
  items: FinancialTransaction[],
  tab: FinancialTab,
  search?: string,
  status?: string,
  dateFrom?: string,
  dateTo?: string,
): FinancialTransaction[] {
  let result = items.filter((t) => t.tab === tab);

  if (search?.trim()) {
    const q = search.trim().toLowerCase();
    result = result.filter(
      (t) =>
        t.transactionId.toLowerCase().includes(q) ||
        t.from.toLowerCase().includes(q) ||
        t.to.toLowerCase().includes(q),
    );
  }

  if (status && status !== 'ALL') {
    result = result.filter((t) => t.status === status);
  }

  if (dateFrom || dateTo) {
    result = result.filter((t) => {
      const d = new Date(t.date).toISOString().slice(0, 10);
      if (dateFrom && d < dateFrom) return false;
      if (dateTo && d > dateTo) return false;
      return true;
    });
  }

  return result;
}
