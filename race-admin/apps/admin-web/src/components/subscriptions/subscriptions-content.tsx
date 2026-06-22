import type { ColumnDef } from '@tanstack/react-table';
import { CreditCard, Hourglass, IndianRupee, type LucideIcon } from 'lucide-react';

import type { SubscriptionMetric, SubscriptionPlan } from '@race/types';
import { cn, formatCurrency } from '@race/utils';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ErrorState,
  LoadingState,
  StatusBadge,
} from '@race/ui';

import { DataTable } from '@/components/shared/data-table';
import { Pagination } from '@/components/shared/pagination';
import { useSubscriptions } from '@/hooks/use-subscriptions';

const METRIC_ICONS: Record<string, LucideIcon> = {
  CreditCard,
  Hourglass,
  IndianRupee,
};

function SubscriptionMetricCard({ metric }: { metric: SubscriptionMetric }) {
  const Icon = METRIC_ICONS[metric.icon] ?? CreditCard;
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

const columns: ColumnDef<SubscriptionPlan, unknown>[] = [
  { accessorKey: 'planName', header: 'Plan Name', cell: ({ row }) => <span className="font-medium">{row.original.planName}</span> },
  { accessorKey: 'type', header: 'Type' },
  { accessorKey: 'activeSubscriptions', header: 'Subscribers' },
  { accessorKey: 'priceLabel', header: 'Price' },
  {
    accessorKey: 'revenue',
    header: 'Revenue',
    cell: ({ row }) => formatCurrency(row.original.revenue),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
];

export function SubscriptionsContent() {
  const {
    tabs,
    activeTab,
    setActiveTab,
    overview,
    overviewLoading,
    data,
    isLoading,
    isError,
    refetch,
    setPage,
    pageSize,
  } = useSubscriptions();

  if (overviewLoading && !overview) {
    return <LoadingState message="Loading subscriptions..." />;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {overview?.metrics.map((m) => (
          <SubscriptionMetricCard key={m.id} metric={m} />
        ))}
      </div>

      <Card>
        <div className="flex flex-wrap gap-1 border-b border-[#EEEEEE] px-4 pt-4">
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

        <CardHeader>
          <CardTitle>Subscription Plans</CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading && !data ? (
            <LoadingState message="Loading plans..." />
          ) : isError ? (
            <ErrorState message="Failed to load plans" onRetry={() => void refetch()} />
          ) : (
            <>
              <DataTable
                columns={columns}
                data={data?.items ?? []}
                emptyMessage="No plans found"
                getRowId={(row) => row.id}
              />
              {data ? (
                <Pagination
                  page={data.page}
                  totalPages={data.totalPages}
                  total={data.total}
                  pageSize={pageSize}
                  onPageChange={setPage}
                />
              ) : null}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
