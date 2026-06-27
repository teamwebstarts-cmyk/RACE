import { formatRelativeTime } from '@race/utils';

import type { ActivityItem } from '@race/types';

export function ActivityTimeline({ items }: { items: ActivityItem[] }) {
  return (
    <ul className="space-y-4">
      {items.map((item, index) => (
        <li key={item.id} className="relative flex gap-3 pl-1">
          {index < items.length - 1 ? (
            <span className="absolute left-[7px] top-5 h-[calc(100%+8px)] w-px bg-[#EEEEEE]" />
          ) : null}
          <span className="relative z-10 mt-1 h-3.5 w-3.5 shrink-0 rounded-full border-2 border-[#F5A623] bg-white" />
          <div className="min-w-0 flex-1 pb-1">
            <p className="text-sm font-medium text-[#1A1A2E]">{item.title}</p>
            {item.description ? (
              <p className="mt-0.5 text-xs text-[#555555]">{item.description}</p>
            ) : null}
            <p className="mt-1 text-xs text-[#9CA3AF]">{formatRelativeTime(item.timestamp)}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
