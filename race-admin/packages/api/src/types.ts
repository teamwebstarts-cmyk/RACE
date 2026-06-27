export type DashboardPeriod = 'this_month' | 'last_month' | 'this_week' | 'custom';

export interface DashboardFilters {
  period?: DashboardPeriod;
  dateFrom?: string;
  dateTo?: string;
}
