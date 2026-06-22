import type { ReportData, ReportFilters, ReportTab } from '@race/types';
import { delay } from '@race/utils';
import { appConfig } from '@race/config';

import { buildReportData } from '../mocks/reports.mock';

export async function getReportData(filters: ReportFilters = {}): Promise<ReportData> {
  await delay(appConfig.mockApiDelayMs);
  const tab = filters.tab ?? 'REVENUE';
  return buildReportData(tab);
}

export async function exportReportData(filters: ReportFilters = {}): Promise<ReportData> {
  await delay(300);
  const tab = filters.tab ?? 'REVENUE';
  return buildReportData(tab);
}

export function getReportTabs(): { key: ReportTab; label: string }[] {
  return [
    { key: 'REVENUE', label: 'Revenue Report' },
    { key: 'BOOKING', label: 'Booking Report' },
    { key: 'DRIVER', label: 'Driver Report' },
    { key: 'CUSTOMER', label: 'Customer Analytics' },
  ];
}
