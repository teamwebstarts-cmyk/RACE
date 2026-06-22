import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Car,
  CheckCircle2,
  ClipboardList,
  Clock,
  IndianRupee,
  PieChart as PieChartIcon,
  Repeat,
  Route,
  Star,
  Timer,
  TrendingUp,
  UserPlus,
  Users,
  Wallet,
  XCircle,
  type LucideIcon,
} from 'lucide-react';

import type { ReportData, ReportMetric } from '@race/types';
import { cn } from '@race/utils';
import { Card, CardContent, ErrorState, LoadingState, Select } from '@race/ui';

import { ChartCard } from '@/components/shared/chart-card';
import { useReports } from '@/hooks/use-reports';

const METRIC_ICONS: Record<string, LucideIcon> = {
  Wallet,
  ClipboardList,
  TrendingUp,
  PieChart: PieChartIcon,
  CheckCircle2,
  XCircle,
  Clock,
  Car,
  Star,
  Route,
  Timer,
  Users,
  UserPlus,
  Repeat,
  IndianRupee,
};

function formatLakhs(value: number) {
  return `${(value / 100000).toFixed(1)}L`;
}

function ReportMetricCard({ metric }: { metric: ReportMetric }) {
  const Icon = METRIC_ICONS[metric.icon] ?? Wallet;
  const display =
    typeof metric.value === 'number' ? metric.value.toLocaleString('en-IN') : metric.value;

  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#F5A623]/15">
          <Icon className="h-5 w-5 text-[#F5A623]" />
        </div>
        <div>
          <p className="text-xs text-[#9CA3AF]">{metric.label}</p>
          <p className="text-xl font-bold text-[#1A1A2E]">{display}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function RevenueTrendChart({ data }: { data: ReportData['revenueTrend'] }) {
  return (
    <ChartCard title="Revenue Trend" subtitle="Daily revenue with gradient area visualization">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="reportRevenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F5A623" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#F5A623" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#EAEAEA" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={formatLakhs} tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
          <Tooltip formatter={(value: number) => formatLakhs(value)} />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#F5A623"
            strokeWidth={2.5}
            fill="url(#reportRevenueGradient)"
            dot={{ r: 3, fill: '#F5A623' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

function TopServicesDonut({ data }: { data: ReportData['topServices'] }) {
  return (
    <ChartCard title="Top Services">
      <div className="flex h-full flex-col items-center justify-center gap-4 lg:flex-row">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        <ul className="w-full space-y-2 lg:w-auto">
          {data.map((item) => (
            <li key={item.name} className="flex items-center justify-between gap-6 text-sm">
              <span className="flex items-center gap-2 text-[#555555]">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                {item.name}
              </span>
              <span className="font-semibold text-[#1A1A2E]">{item.value}%</span>
            </li>
          ))}
        </ul>
      </div>
    </ChartCard>
  );
}

function MonthlyComparisonChart({ data }: { data: ReportData['monthlyComparison'] }) {
  const chartData = data.filter((d) => d.current > 0 || d.previous > 0).slice(0, 6);

  return (
    <ChartCard title="Monthly Comparison">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#EEEEEE" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#555555' }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={formatLakhs} tick={{ fontSize: 12, fill: '#555555' }} axisLine={false} tickLine={false} />
          <Tooltip formatter={(value: number) => formatLakhs(value)} />
          <Legend />
          <Bar dataKey="current" name="This Month" fill="#F5A623" radius={[6, 6, 0, 0]} />
          <Bar dataKey="previous" name="Last Month" fill="#E5E7EB" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function ReportsContent() {
  const {
    tabs,
    activeTab,
    setActiveTab,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    period,
    setPeriod,
    data,
    isLoading,
    isError,
    refetch,
    handleExport,
  } = useReports();

  if (isLoading && !data) return <LoadingState message="Loading reports..." />;
  if (isError || !data) {
    return <ErrorState message="Failed to load reports" onRetry={() => void refetch()} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-1 border-b border-[#EEEEEE]">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'border-b-2 px-4 py-2 text-sm font-medium transition-colors',
              activeTab === tab.key
                ? 'border-[#F5A623] text-[#F5A623]'
                : 'border-transparent text-[#555555] hover:text-[#1A1A2E]',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-[#EEEEEE] bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-[#555555]">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="h-9 rounded-lg border border-[#EEEEEE] px-2 text-sm"
            />
            <span>–</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="h-9 rounded-lg border border-[#EEEEEE] px-2 text-sm"
            />
          </label>
          <Select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="h-9 w-[140px]"
          >
            <option value="this_month">This Month</option>
            <option value="last_month">Last Month</option>
            <option value="this_quarter">This Quarter</option>
            <option value="custom">Custom</option>
          </Select>
        </div>
        <button
          type="button"
          onClick={() => void handleExport()}
          className="inline-flex h-9 items-center justify-center rounded-lg border border-[#EEEEEE] bg-white px-4 text-sm font-medium text-[#1A1A2E] hover:bg-[#F4F5F7]"
        >
          Export
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {data.metrics.map((m) => (
          <ReportMetricCard key={m.id} metric={m} />
        ))}
      </div>

      <RevenueTrendChart data={data.revenueTrend} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <TopServicesDonut data={data.topServices} />
        <MonthlyComparisonChart data={data.monthlyComparison} />
      </div>
    </div>
  );
}
