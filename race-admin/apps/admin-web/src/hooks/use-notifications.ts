import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import {
  deleteNotification,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '@race/api';
import type { NotificationFilter, NotificationListFilters } from '@race/types';

const PAGE_SIZE = 10;

export function useNotifications() {
  const [filter, setFilter] = useState<NotificationFilter>('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const filters: NotificationListFilters = useMemo(
    () => ({ filter, search, page, pageSize: PAGE_SIZE }),
    [filter, search, page],
  );

  const query = useQuery({
    queryKey: ['notifications', filters],
    queryFn: () => getNotifications(filters),
    placeholderData: (prev) => prev,
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['notifications'] });
    void queryClient.invalidateQueries({ queryKey: ['notification-count'] });
  };

  const markRead = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: invalidate,
  });

  const markAllRead = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: deleteNotification,
    onSuccess: invalidate,
  });

  const resetPage = () => setPage(1);

  return {
    ...query,
    filter,
    setFilter: (v: NotificationFilter) => {
      setFilter(v);
      resetPage();
    },
    search,
    setSearch: (v: string) => {
      setSearch(v);
      resetPage();
    },
    page,
    setPage,
    pageSize: PAGE_SIZE,
    markRead,
    markAllRead,
    remove,
  };
}
