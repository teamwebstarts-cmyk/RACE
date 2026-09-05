import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import { exportFinancialTransactions, getFinancialOverview, getFinancialTransactions } from '@race/api';
import type { FinancialListFilters, FinancialTab } from '@race/types';
import { exportToCsv } from '@race/utils';

const PAGE_SIZE = 10;

const TABS: { key: FinancialTab; label: string }[] = [
  { key: 'PAYMENTS', label: 'Payments' },
  { key: 'VENDOR_PAYOUTS', label: 'Vendor Payouts' },
  { key: 'COMMISSIONS', label: 'Commissions' },
  { key: 'REFUNDS', label: 'Refunds' },
  { key: 'SUBSCRIPTION_REVENUE', label: 'Subscription Revenue' },
];

export function useFinancial() {
  const [activeTab, setActiveTab] = useState<FinancialTab>('PAYMENTS');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);

  const filters: FinancialListFilters = useMemo(
    () => ({
      tab: activeTab,
      search,
      status,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      page,
      pageSize: PAGE_SIZE,
    }),
    [activeTab, search, status, dateFrom, dateTo, page],
  );

  const overviewQuery = useQuery({
    queryKey: ['financial-overview'],
    queryFn: getFinancialOverview,
  });

  const transactionsQuery = useQuery({
    queryKey: ['financial-transactions', filters],
    queryFn: () => getFinancialTransactions(filters),
    placeholderData: (prev) => prev,
  });

  const resetPage = () => setPage(1);

  const handleExport = async () => {
    const rows = await exportFinancialTransactions(filters);
    exportToCsv(`financial-${activeTab.toLowerCase()}.csv`, rows, [
      { key: 'transactionId', header: 'Transaction ID' },
      { key: 'type', header: 'Type' },
      { key: 'from', header: 'From' },
      { key: 'to', header: 'To' },
      { key: 'amount', header: 'Amount' },
      { key: 'status', header: 'Status' },
      { key: 'date', header: 'Date' },
    ]);
  };

  return {
    tabs: TABS,
    activeTab,
    setActiveTab: (tab: FinancialTab) => {
      setActiveTab(tab);
      resetPage();
    },
    overview: overviewQuery.data,
    overviewLoading: overviewQuery.isLoading,
    ...transactionsQuery,
    search,
    setSearch: (v: string) => {
      setSearch(v);
      resetPage();
    },
    status,
    setStatus: (v: string) => {
      setStatus(v);
      resetPage();
    },
    dateFrom,
    setDateFrom: (v: string) => {
      setDateFrom(v);
      resetPage();
    },
    dateTo,
    setDateTo: (v: string) => {
      setDateTo(v);
      resetPage();
    },
    page,
    setPage,
    pageSize: PAGE_SIZE,
    handleExport,
  };
}
