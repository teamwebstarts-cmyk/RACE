import {
  Building2,
  Car,
  CheckCircle2,
  ClipboardList,
  Hourglass,
  IndianRupee,
  TrendingDown,
  TrendingUp,
  Users,
  type LucideIcon,
} from 'lucide-react';

import type { StatMetric } from '@race/types';
import { formatNumber } from '@race/utils';
import { Card, CardContent } from '@race/ui';

const ICONS: Record<string, LucideIcon> = {
  Users,
  Building2,
  Car,
  ClipboardList,
  CheckCircle2,
  IndianRupee,
  Hourglass,
};

export function StatCard({ metric }: { metric: StatMetric }) {
  const Icon = metric.icon ? ICONS[metric.icon] ?? Users : Users;
  const displayValue =
    typeof metric.value === 'number' ? formatNumber(metric.value) : metric.value;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm text-[#555555]">{metric.label}</p>
            <p className="mt-2 text-2xl font-bold text-[#1A1A2E]">{displayValue}</p>
            {metric.trend ? (
              <div className="mt-2 flex items-center gap-1 text-xs">
                {metric.trend.direction === 'up' ? (
                  <TrendingUp className="h-3.5 w-3.5 text-[#16A34A]" />
                ) : metric.trend.direction === 'down' ? (
                  <TrendingDown className="h-3.5 w-3.5 text-[#DC2626]" />
                ) : null}
                <span
                  className={
                    metric.trend.direction === 'up'
                      ? 'text-[#16A34A]'
                      : metric.trend.direction === 'down'
                        ? 'text-[#DC2626]'
                        : 'text-[#555555]'
                  }
                >
                  {metric.trend.value}
                </span>
                {metric.trend.label ? (
                  <span className="text-[#9CA3AF]">{metric.trend.label}</span>
                ) : null}
              </div>
            ) : null}
          </div>
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
              metric.variant === 'warning' ? 'bg-[#D97706]/15' : 'bg-[#F5A623]/15'
            }`}
          >
            <Icon
              className={`h-5 w-5 ${metric.variant === 'warning' ? 'text-[#D97706]' : 'text-[#F5A623]'}`}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
