import type { DashboardData } from '@race/types';

import { apiGet } from '../http';

export async function fetchDashboard(params?: { period?: string }): Promise<DashboardData> {
  return apiGet<DashboardData>('/dashboard', params as Record<string, unknown>);
}
