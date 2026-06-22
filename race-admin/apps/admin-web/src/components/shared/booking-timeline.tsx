import { formatRelativeTime } from '@race/utils';

import type { BookingTimelineEvent } from '@race/types';
import { StatusBadge } from '@race/ui';
import { cn } from '@race/utils';

const DOT_COLORS: Record<string, string> = {
  CREATED: 'border-[#D97706] bg-[#FEF3C7]',
  ASSIGNED: 'border-[#7C3AED] bg-[#EDE9FE]',
  EN_ROUTE: 'border-[#2563EB] bg-[#DBEAFE]',
  IN_PROGRESS: 'border-[#2563EB] bg-[#DBEAFE]',
  COMPLETED: 'border-[#16A34A] bg-[#D1FAE5]',
  CANCELLED: 'border-[#DC2626] bg-[#FEE2E2]',
};

export function BookingTimeline({ events }: { events: BookingTimelineEvent[] }) {
  return (
    <ul className="space-y-4">
      {events.map((event, index) => (
        <li key={event.id} className="relative flex gap-3 pl-1">
          {index < events.length - 1 ? (
            <span className="absolute left-[7px] top-5 h-[calc(100%+8px)] w-px bg-[#EEEEEE]" />
          ) : null}
          <span
            className={cn(
              'relative z-10 mt-1 h-3.5 w-3.5 shrink-0 rounded-full border-2',
              DOT_COLORS[event.status.toUpperCase()] ?? 'border-[#F5A623] bg-white',
            )}
          />
          <div className="min-w-0 flex-1 pb-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-medium text-[#1A1A2E]">{event.title}</p>
              <StatusBadge status={event.status} />
            </div>
            {event.description ? (
              <p className="mt-0.5 text-xs text-[#555555]">{event.description}</p>
            ) : null}
            <p className="mt-1 text-xs text-[#9CA3AF]">{formatRelativeTime(event.timestamp)}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
