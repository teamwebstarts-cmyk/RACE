import type { ReportData, ReportMetric, ReportTab } from '@race/types';

const BASE_METRICS: Record<ReportTab, ReportMetric[]> = {
  REVENUE: [
    { id: 'r1', label: 'Total Revenue', value: '₹18,45,300', icon: 'Wallet' },
    { id: 'r2', label: 'Total Bookings', value: 568, icon: 'ClipboardList' },
    { id: 'r3', label: 'Avg. Booking Value', value: '₹1,245', icon: 'TrendingUp' },
    { id: 'r4', label: 'Completion Rate', value: '78.5%', icon: 'PieChart' },
  ],
  BOOKING: [
    { id: 'b1', label: 'Total Bookings', value: 568, icon: 'ClipboardList' },
    { id: 'b2', label: 'Completed', value: 219, icon: 'CheckCircle2' },
    { id: 'b3', label: 'Cancelled', value: 48, icon: 'XCircle' },
    { id: 'b4', label: 'Avg. Response Time', value: '12 min', icon: 'Clock' },
  ],
  DRIVER: [
    { id: 'd1', label: 'Active Drivers', value: 500, icon: 'Car' },
    { id: 'd2', label: 'Avg. Rating', value: '4.6', icon: 'Star' },
    { id: 'd3', label: 'Trips Completed', value: '12,450', icon: 'Route' },
    { id: 'd4', label: 'On-Time Rate', value: '92%', icon: 'Timer' },
  ],
  CUSTOMER: [
    { id: 'c1', label: 'Total Customers', value: '12,458', icon: 'Users' },
    { id: 'c2', label: 'New This Month', value: 342, icon: 'UserPlus' },
    { id: 'c3', label: 'Repeat Rate', value: '64%', icon: 'Repeat' },
    { id: 'c4', label: 'Avg. Lifetime Value', value: '₹4,850', icon: 'IndianRupee' },
  ],
};

export function buildReportData(tab: ReportTab): ReportData {
  return {
    metrics: BASE_METRICS[tab],
    revenueTrend: Array.from({ length: 17 }, (_, i) => ({
      label: `${i + 1} Jun`,
      revenue: 1200000 + i * 85000 + (tab === 'REVENUE' ? 0 : i * 10000),
    })),
    topServices: [
      { name: 'Towing Service', value: 45, color: '#F5A623' },
      { name: 'Driver Service', value: 25, color: '#6B7280' },
      { name: 'Roadside Assist', value: 20, color: '#9CA3AF' },
      { name: 'Other Services', value: 10, color: '#D1D5DB' },
    ],
    monthlyComparison: [
      { month: 'Jan', current: 4200000, previous: 3800000 },
      { month: 'Feb', current: 4500000, previous: 4100000 },
      { month: 'Mar', current: 4800000, previous: 4300000 },
      { month: 'Apr', current: 5100000, previous: 4600000 },
      { month: 'May', current: 5400000, previous: 4900000 },
      { month: 'Jun', current: 5700000, previous: 5200000 },
      { month: 'Jul', current: 0, previous: 5500000 },
      { month: 'Aug', current: 0, previous: 5800000 },
      { month: 'Sep', current: 0, previous: 6000000 },
      { month: 'Oct', current: 0, previous: 6200000 },
      { month: 'Nov', current: 0, previous: 6400000 },
      { month: 'Dec', current: 0, previous: 6600000 },
    ].map((m) => ({
      ...m,
      current: tab === 'REVENUE' ? m.current : Math.round(m.current * 0.7),
      previous: tab === 'REVENUE' ? m.previous : Math.round(m.previous * 0.7),
    })),
  };
}
