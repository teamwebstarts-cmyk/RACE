import type { ColumnDef } from '@tanstack/react-table';
import {
  ArrowLeftRight,
  Percent,
  RotateCcw,
  TrendingDown,
  TrendingUp,
  Wallet,
  type LucideIcon,
} from 'lucide-react';

import type { FinancialMetric, FinancialTransaction } from '@race/types';
import { cn, formatCurrency, formatDateTime } from '@race/utils';
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
import { ListToolbar } from '@/components/shared/list-toolbar';
import { Pagination } from '@/components/shared/pagination';
import { useFinancial } from '@/hooks/use-financial';

const METRIC_ICONS: Record<string, LucideIcon> = {
  Wallet,
  ArrowLeftRight,
  Percent,
  RotateCcw,
};

function FinancialMetricCard({ metric }: { metric: FinancialMetric }) {
  const Icon = METRIC_ICONS[metric.icon] ?? Wallet;

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-[#555555]">{metric.label}</p>
            <p className="mt-2 text-2xl font-bold text-[#1A1A2E]">{metric.value}</p>
            {metric.trend ? (
              <div className="mt-2 flex items-center gap-1 text-xs">
                {metric.trend.direction === 'up' ? (
                  <TrendingUp className="h-3.5 w-3.5 text-[#16A34A]" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5 text-[#DC2626]" />
                )}
                <span
                  className={
                    metric.trend.direction === 'up' ? 'text-[#16A34A]' : 'text-[#DC2626]'
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
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F5A623]/15">
            <Icon className="h-5 w-5 text-[#F5A623]" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const columns: ColumnDef<FinancialTransaction, unknown>[] = [
  {
    accessorKey: 'transactionId',
    header: 'Transaction ID',
    cell: ({ row }) => (
      <span className="font-medium text-[#F5A623]">{row.original.transactionId}</span>
    ),
  },
  { accessorKey: 'type', header: 'Type' },
  { accessorKey: 'from', header: 'From' },
  { accessorKey: 'to', header: 'To' },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ row }) => formatCurrency(row.original.amount),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    accessorKey: 'date',
    header: 'Date & Time',
    cell: ({ row }) => (
      <span className="text-[#555555]">{formatDateTime(row.original.date)}</span>
    ),
  },
];

export function FinancialContent() {
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
    search,
    setSearch,
    status,
    setStatus,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    setPage,
    pageSize,
    handleExport,
  } = useFinancial();

  if (overviewLoading && !overview) {
    return <LoadingState message="Loading financial overview..." />;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {overview?.metrics.map((m) => <FinancialMetricCard key={m.id} metric={m} />)}
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

        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          <ListToolbar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search transactions..."
            filters={[
              {
                id: 'status',
                label: 'Status',
                value: status,
                onChange: setStatus,
                options: [
                  { label: 'All Status', value: 'ALL' },
                  { label: 'Completed', value: 'COMPLETED' },
                  { label: 'Pending', value: 'PENDING' },
                ],
              },
            ]}
            onExport={() => void handleExport()}
            exportLabel="Export"
            showAdd={false}
          />

          <div className="flex flex-wrap items-center gap-3 border-b border-[#EEEEEE] px-4 py-3">
            <label className="flex items-center gap-2 text-sm text-[#555555]">
              From
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="h-9 rounded-lg border border-[#EEEEEE] px-2 text-sm"
              />
            </label>
            <label className="flex items-center gap-2 text-sm text-[#555555]">
              To
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="h-9 rounded-lg border border-[#EEEEEE] px-2 text-sm"
              />
            </label>
          </div>

          {isLoading && !data ? (
            <LoadingState message="Loading transactions..." />
          ) : isError ? (
            <ErrorState message="Failed to load transactions" onRetry={() => void refetch()} />
          ) : (
            <>
              <DataTable
                columns={columns}
                data={data?.items ?? []}
                emptyMessage="No transactions found"
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
