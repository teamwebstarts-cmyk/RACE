import {
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

import type { ChartDataPoint, DonutSegment } from '@race/types';
import { Select } from '@race/ui';

import { ChartCard } from '@/components/shared/chart-card';
import { useDashboardStore } from '@/stores/dashboard.store';

function formatLakhs(value: number) {
  return `${(value / 100000).toFixed(1)}L`;
}

export function RevenueChart({ data }: { data: ChartDataPoint[] }) {
  const period = useDashboardStore((s) => s.period);
  const setPeriod = useDashboardStore((s) => s.setPeriod);

  return (
    <ChartCard
      title="Revenue Overview"
      action={
        <Select
          value={period}
          onChange={(e) => setPeriod(e.target.value as 'this_month')}
          className="w-[140px]"
        >
          <option value="this_month">This Month</option>
          <option value="last_month">Last Month</option>
        </Select>
      }
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#EEEEEE" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#555555' }} axisLine={false} tickLine={false} />
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

export function BookingsChart({ data }: { data: ChartDataPoint[] }) {
  return (
    <ChartCard
      title="Bookings Overview"
      action={
        <Select defaultValue="this_month" className="w-[140px]">
          <option value="this_month">This Month</option>
          <option value="last_month">Last Month</option>
        </Select>
      }
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#EEEEEE" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#555555' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: '#555555' }} axisLine={false} tickLine={false} />
          <Tooltip />
          <Legend />
          <Bar dataKey="current" name="This Month" fill="#F5A623" radius={[6, 6, 0, 0]} />
          <Bar dataKey="previous" name="Last Month" fill="#E5E7EB" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function TopServicesChart({ data }: { data: DonutSegment[] }) {
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
