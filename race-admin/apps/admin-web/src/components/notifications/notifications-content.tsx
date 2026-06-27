import { Bell, CheckCheck, Search, Trash2 } from 'lucide-react';

import type { AdminNotification, NotificationFilter } from '@race/types';
import { cn, formatRelativeTime } from '@race/utils';
import { Button, Card, CardContent, ErrorState, LoadingState, StatusBadge } from '@race/ui';

import { Pagination } from '@/components/shared/pagination';
import { useNotifications } from '@/hooks/use-notifications';

const FILTERS: { key: NotificationFilter; label: string }[] = [
  { key: 'ALL', label: 'All' },
  { key: 'UNREAD', label: 'Unread' },
  { key: 'READ', label: 'Read' },
  { key: 'SYSTEM', label: 'System Alerts' },
];

function NotificationItem({
  item,
  onMarkRead,
  onDelete,
}: {
  item: AdminNotification;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div
      className={cn(
        'flex gap-4 border-b border-[#EEEEEE] px-4 py-4 last:border-0',
        !item.isRead && 'bg-[#FFFBEB]',
      )}
    >
      <div
        className={cn(
          'mt-1 h-2.5 w-2.5 shrink-0 rounded-full',
          item.isRead ? 'bg-transparent' : 'bg-[#F5A623]',
        )}
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium text-[#1A1A2E]">{item.title}</p>
          <StatusBadge status={item.type} />
        </div>
        <p className="mt-1 text-sm text-[#555555]">{item.message}</p>
        <p className="mt-2 text-xs text-[#9CA3AF]">{formatRelativeTime(item.createdAt)}</p>
      </div>
      <div className="flex shrink-0 gap-1">
        {!item.isRead ? (
          <button
            type="button"
            onClick={() => onMarkRead(item.id)}
            className="rounded-md p-2 text-[#9CA3AF] hover:bg-[#F4F5F7] hover:text-[#F5A623]"
            aria-label="Mark as read"
          >
            <CheckCheck className="h-4 w-4" />
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => onDelete(item.id)}
          className="rounded-md p-2 text-[#9CA3AF] hover:bg-[#FEF2F2] hover:text-[#DC2626]"
          aria-label="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function NotificationsContent() {
  const {
    data,
    isLoading,
    isError,
    refetch,
    filter,
    setFilter,
    search,
    setSearch,
    setPage,
    pageSize,
    markRead,
    markAllRead,
    remove,
  } = useNotifications();

  if (isLoading && !data) return <LoadingState message="Loading notifications..." />;
  if (isError) return <ErrorState message="Failed to load notifications" onRetry={() => void refetch()} />;

  return (
    <Card>
      <div className="flex flex-col gap-3 border-b border-[#EEEEEE] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                filter === f.key
                  ? 'bg-[#F5A623] text-white'
                  : 'border border-[#EEEEEE] text-[#555555] hover:bg-[#F4F5F7]',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => markAllRead.mutate()}
          disabled={markAllRead.isPending}
          className="gap-2"
        >
          <CheckCheck className="h-4 w-4" />
          Mark all read
        </Button>
      </div>

      <div className="border-b border-[#EEEEEE] px-4 py-3">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notifications..."
            className="flex h-10 w-full rounded-lg border border-[#EEEEEE] bg-white pl-10 pr-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5A623]"
          />
        </div>
      </div>

      <CardContent className="p-0">
        {data?.items.length ? (
          data.items.map((item) => (
            <NotificationItem
              key={item.id}
              item={item}
              onMarkRead={(id) => markRead.mutate(id)}
              onDelete={(id) => remove.mutate(id)}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-[#9CA3AF]">
            <Bell className="h-10 w-10" />
            <p className="text-sm">No notifications found</p>
          </div>
        )}

        {data ? (
          <Pagination
            page={data.page}
            totalPages={data.totalPages}
            total={data.total}
            pageSize={pageSize}
            onPageChange={setPage}
          />
        ) : null}
      </CardContent>
    </Card>
  );
}
