import { useQuery } from '@tanstack/react-query';

import { fetchDashboard } from '@race/api';

import { useDashboardStore } from '@/stores/dashboard.store';

export const dashboardKeys = {
  all: ['dashboard'] as const,
  summary: (period: string) => ['dashboard', period] as const,
};

export function useDashboardQuery() {
  const period = useDashboardStore((s) => s.period);

  return useQuery({
    queryKey: dashboardKeys.summary(period),
    queryFn: () => fetchDashboard({ period }),
  });
}
