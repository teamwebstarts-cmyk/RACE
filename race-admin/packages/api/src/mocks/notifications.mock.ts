import type { AdminNotification } from '@race/types';

export const MOCK_NOTIFICATIONS: AdminNotification[] = [
  {
    id: 'n1',
    title: 'New vendor registration pending',
    message: 'RACE Towing Pvt Ltd has submitted documents for verification.',
    type: 'VENDOR',
    isRead: false,
    createdAt: '2025-06-17T10:25:00Z',
  },
  {
    id: 'n2',
    title: 'Booking #BKA756 en route',
    message: 'Driver Ravi Kumar is en route to customer Rahul Sharma.',
    type: 'BOOKING',
    isRead: false,
    createdAt: '2025-06-17T10:10:00Z',
  },
  {
    id: 'n3',
    title: 'System maintenance scheduled',
    message: 'Scheduled maintenance on 20 Jun 2025, 2:00 AM – 4:00 AM IST.',
    type: 'SYSTEM',
    isRead: false,
    createdAt: '2025-06-17T08:00:00Z',
  },
  {
    id: 'n4',
    title: 'Payment received',
    message: '₹1,499 received for booking #BKA742.',
    type: 'PAYMENT',
    isRead: true,
    createdAt: '2025-06-16T16:30:00Z',
  },
  {
    id: 'n5',
    title: 'High cancellation rate alert',
    message: 'Cancellation rate exceeded 8% in Bhubaneswar zone.',
    type: 'ALERT',
    isRead: false,
    createdAt: '2025-06-16T12:00:00Z',
  },
  {
    id: 'n6',
    title: 'Driver approval pending',
    message: '3 driver applications awaiting verification.',
    type: 'SYSTEM',
    isRead: true,
    createdAt: '2025-06-15T09:45:00Z',
  },
  {
    id: 'n7',
    title: 'Subscription expiring soon',
    message: '87 customer subscriptions expire this month.',
    type: 'ALERT',
    isRead: true,
    createdAt: '2025-06-14T11:20:00Z',
  },
  {
    id: 'n8',
    title: 'New booking created',
    message: 'Booking #BKA801 created for towing service.',
    type: 'BOOKING',
    isRead: true,
    createdAt: '2025-06-13T15:10:00Z',
  },
];

export function filterNotifications(
  items: AdminNotification[],
  filter: string,
  search?: string,
): AdminNotification[] {
  let result = [...items];

  if (filter === 'UNREAD') result = result.filter((n) => !n.isRead);
  else if (filter === 'READ') result = result.filter((n) => n.isRead);
  else if (filter === 'SYSTEM') result = result.filter((n) => n.type === 'SYSTEM' || n.type === 'ALERT');

  if (search?.trim()) {
    const q = search.trim().toLowerCase();
    result = result.filter(
      (n) => n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q),
    );
  }

  return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
