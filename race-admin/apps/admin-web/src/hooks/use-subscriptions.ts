import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import { getSubscriptionOverview, getSubscriptionPlans } from '@race/api';
import type { SubscriptionListFilters, SubscriptionPlanTab } from '@race/types';

const PAGE_SIZE = 10;

const TABS: { key: SubscriptionPlanTab; label: string }[] = [
  { key: 'CUSTOMER', label: 'Customer Plans' },
  { key: 'VENDOR', label: 'Vendor Plans' },
];

export function useSubscriptions() {
  const [activeTab, setActiveTab] = useState<SubscriptionPlanTab>('CUSTOMER');
  const [page, setPage] = useState(1);

  const filters: SubscriptionListFilters = useMemo(
    () => ({ tab: activeTab, page, pageSize: PAGE_SIZE }),
    [activeTab, page],
  );

  const overviewQuery = useQuery({
    queryKey: ['subscription-overview'],
    queryFn: getSubscriptionOverview,
  });

  const plansQuery = useQuery({
    queryKey: ['subscription-plans', filters],
    queryFn: () => getSubscriptionPlans(filters),
    placeholderData: (prev) => prev,
  });

  return {
    tabs: TABS,
    activeTab,
    setActiveTab: (tab: SubscriptionPlanTab) => {
      setActiveTab(tab);
      setPage(1);
    },
    overview: overviewQuery.data,
    overviewLoading: overviewQuery.isLoading,
    ...plansQuery,
    page,
    setPage,
    pageSize: PAGE_SIZE,
  };
}
