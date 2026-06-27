import type { ReportData, ReportTab } from '@race/types';

import { apiGet } from '../http';

const COLORS = ['#F5A623', '#6B7280', '#9CA3AF', '#D97706', '#16A34A', '#2563EB'];

type ReportsApiResponse = {
  revenueTrend: { label: string; value: number }[];
  bookingTrend: { label: string; value: number }[];
  vendorGrowth: { label: string; value: number }[];
  customerGrowth: { label: string; value: number }[];
  serviceDistribution: { name: string; value: number }[];
  topVendors: { id: string; name: string; bookings: number; revenue: number }[];
  topDrivers: { id: string; name: string; trips: number; rating: number }[];
  completionRate: number;
  cancellationRate: number;
  summary: {
    totalRevenue: number;
    totalBookings: number;
    totalVendors: number;
    totalCustomers: number;
    totalDrivers: number;
    completedBookings: number;
    cancelledBookings: number;
    avgBookingValue: number;
    newCustomers: number;
    avgDriverRating: number;
    totalDriverTrips: number;
  };
};

function toPercentages(items: { name: string; value: number }[]) {
  const total = items.reduce((sum, item) => sum + item.value, 0);
  return items.map((item, index) => ({
    name: item.name,
    value: total ? Math.round((item.value / total) * 100) : 0,
    color: COLORS[index % COLORS.length],
  }));
}

function toComparison(points: { label: string; value: number }[]) {
  return points.map((point, index) => ({
    month: point.label,
    current: point.value,
    previous: index > 0 ? points[index - 1].value : Math.round(point.value * 0.9),
  }));
}

function formatCurrency(amount: number) {
  return `₹${amount.toLocaleString('en-IN')}`;
}

function buildReportData(tab: ReportTab, raw: ReportsApiResponse): ReportData {
  const topServices = toPercentages(raw.serviceDistribution);
  const { summary } = raw;

  if (tab === 'BOOKING') {
    return {
      metrics: [
        { id: 'b1', label: 'Total Bookings', value: summary.totalBookings, icon: 'ClipboardList' },
        { id: 'b2', label: 'Completed', value: summary.completedBookings, icon: 'CheckCircle2' },
        { id: 'b3', label: 'Cancelled', value: summary.cancelledBookings, icon: 'XCircle' },
        { id: 'b4', label: 'Completion Rate', value: `${raw.completionRate}%`, icon: 'PieChart' },
      ],
      revenueTrend: raw.bookingTrend.map((point) => ({ label: point.label, revenue: point.value })),
      topServices,
      monthlyComparison: toComparison(raw.bookingTrend),
    };
  }

  if (tab === 'DRIVER') {
    return {
      metrics: [
        { id: 'd1', label: 'Active Drivers', value: summary.totalDrivers, icon: 'Car' },
        { id: 'd2', label: 'Avg. Rating', value: summary.avgDriverRating.toFixed(1), icon: 'Star' },
        { id: 'd3', label: 'Trips Completed', value: summary.totalDriverTrips, icon: 'Route' },
        { id: 'd4', label: 'Top Driver Trips', value: raw.topDrivers[0]?.trips ?? 0, icon: 'Timer' },
      ],
      revenueTrend: raw.topDrivers.map((driver) => ({ label: driver.name, revenue: driver.trips })),
      topServices,
      monthlyComparison: toComparison(raw.vendorGrowth),
    };
  }

  if (tab === 'CUSTOMER') {
    return {
      metrics: [
        { id: 'c1', label: 'Total Customers', value: summary.totalCustomers, icon: 'Users' },
        { id: 'c2', label: 'New in Range', value: summary.newCustomers, icon: 'UserPlus' },
        { id: 'c3', label: 'Total Bookings', value: summary.totalBookings, icon: 'ClipboardList' },
        { id: 'c4', label: 'Avg. Booking Value', value: formatCurrency(summary.avgBookingValue), icon: 'IndianRupee' },
      ],
      revenueTrend: raw.customerGrowth.map((point) => ({ label: point.label, revenue: point.value })),
      topServices,
      monthlyComparison: toComparison(raw.customerGrowth),
    };
  }

  return {
    metrics: [
      { id: 'r1', label: 'Total Revenue', value: formatCurrency(summary.totalRevenue), icon: 'Wallet' },
      { id: 'r2', label: 'Total Bookings', value: summary.totalBookings, icon: 'ClipboardList' },
      { id: 'r3', label: 'Avg. Booking Value', value: formatCurrency(summary.avgBookingValue), icon: 'TrendingUp' },
      { id: 'r4', label: 'Completion Rate', value: `${raw.completionRate}%`, icon: 'PieChart' },
    ],
    revenueTrend: raw.revenueTrend.map((point) => ({ label: point.label, revenue: point.value })),
    topServices,
    monthlyComparison: toComparison(raw.revenueTrend),
  };
}

export async function getReportData(params: {
  tab?: string;
  dateFrom?: string;
  dateTo?: string;
}): Promise<ReportData> {
  const raw = await apiGet<ReportsApiResponse>('/reports', {
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
  });

  const tab = (params.tab?.toUpperCase() ?? 'REVENUE') as ReportTab;
  return buildReportData(tab, raw);
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
