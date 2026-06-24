import type { ReportData, ReportTab } from '@race/types';

import { apiGet } from '../http';

export async function getReportData(params: {
  tab?: string;
  dateFrom?: string;
  dateTo?: string;
}): Promise<ReportData> {
  const raw = await apiGet<{
    revenueTrend: { label: string; value: number }[];
    bookingTrend: { label: string; value: number }[];
    serviceDistribution: { name: string; value: number }[];
    completionRate: number;
    cancellationRate: number;
    summary: { totalRevenue: number; totalBookings: number; totalVendors: number; totalCustomers: number };
  }>('/reports', { dateFrom: params.dateFrom, dateTo: params.dateTo });

  const tab = (params.tab?.toUpperCase() ?? 'REVENUE') as ReportTab;

  const metrics = [
    { id: 'r1', label: 'Total Revenue', value: `₹${raw.summary.totalRevenue.toLocaleString('en-IN')}`, icon: 'Wallet' },
    { id: 'r2', label: 'Total Bookings', value: raw.summary.totalBookings, icon: 'ClipboardList' },
    { id: 'r3', label: 'Completion Rate', value: `${raw.completionRate}%`, icon: 'PieChart' },
    { id: 'r4', label: 'Cancellation Rate', value: `${raw.cancellationRate}%`, icon: 'XCircle' },
  ];

  if (tab === 'BOOKING') {
    return {
      metrics,
      revenueTrend: raw.bookingTrend.map((b) => ({ label: b.label, revenue: b.value })),
      topServices: raw.serviceDistribution.map((s, i) => ({
        name: s.name,
        value: s.value,
        color: ['#F5A623', '#6B7280', '#9CA3AF', '#D97706', '#16A34A', '#2563EB'][i % 6],
      })),
      monthlyComparison: raw.bookingTrend.map((b) => ({
        month: b.label,
        current: b.value,
        previous: Math.round(b.value * 0.85),
      })),
    };
  }

  return {
    metrics,
    revenueTrend: raw.revenueTrend.map((r) => ({ label: r.label, revenue: r.value })),
    topServices: raw.serviceDistribution.map((s, i) => ({
      name: s.name,
      value: s.value,
      color: ['#F5A623', '#6B7280', '#9CA3AF', '#D97706', '#16A34A', '#2563EB'][i % 6],
    })),
    monthlyComparison: raw.revenueTrend.map((r) => ({
      month: r.label,
      current: r.value,
      previous: Math.round(r.value * 0.9),
    })),
  };
}

export async function exportReportData(params: { tab?: string; dateFrom?: string; dateTo?: string }) {
  const data = await getReportData(params);
  return data.revenueTrend;
}

export function getReportTabs(): { key: ReportTab; label: string }[] {
  return [
    { key: 'REVENUE', label: 'Revenue' },
    { key: 'BOOKING', label: 'Bookings' },
    { key: 'DRIVER', label: 'Drivers' },
    { key: 'CUSTOMER', label: 'Customers' },
  ];
}
