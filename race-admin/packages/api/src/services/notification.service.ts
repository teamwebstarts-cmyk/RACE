import type { AdminNotification, NotificationListFilters, PaginatedResponse } from '@race/types';
import { delay } from '@race/utils';
import { appConfig } from '@race/config';

import { filterNotifications, MOCK_NOTIFICATIONS } from '../mocks/notifications.mock';

export async function getNotifications(
  filters: NotificationListFilters = {},
): Promise<PaginatedResponse<AdminNotification>> {
  await delay(appConfig.mockApiDelayMs);

  const filter = filters.filter ?? 'ALL';
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 10;
  const filtered = filterNotifications(MOCK_NOTIFICATIONS, filter, filters.search);
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;

  return {
    items: filtered.slice(start, start + pageSize),
    total,
    page,
    pageSize,
    totalPages,
  };
}

export async function markNotificationRead(id: string): Promise<void> {
  await delay(200);
  const n = MOCK_NOTIFICATIONS.find((item) => item.id === id);
  if (n) n.isRead = true;
}

export async function markAllNotificationsRead(): Promise<void> {
  await delay(300);
  MOCK_NOTIFICATIONS.forEach((n) => {
    n.isRead = true;
  });
}

export async function deleteNotification(id: string): Promise<void> {
  await delay(200);
  const idx = MOCK_NOTIFICATIONS.findIndex((item) => item.id === id);
  if (idx >= 0) MOCK_NOTIFICATIONS.splice(idx, 1);
}

export function getUnreadNotificationCount(): number {
  return MOCK_NOTIFICATIONS.filter((n) => !n.isRead).length;
}
