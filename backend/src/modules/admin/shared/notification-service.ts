import type { Types } from 'mongoose';

import { AdminNotificationModel } from '../models/admin-notification.model';

export type NotificationCategory =
  | 'vendor'
  | 'driver'
  | 'booking'
  | 'payment'
  | 'customer'
  | 'system'
  | 'subscription';

export interface CreateNotificationInput {
  title: string;
  message?: string;
  type?: 'info' | 'warning' | 'success' | 'error';
  category: NotificationCategory;
  adminId?: Types.ObjectId | string;
  entityType?: string;
  entityId?: string;
}

export async function createNotification(input: CreateNotificationInput): Promise<void> {
  await AdminNotificationModel.create({
    title: input.title,
    message: input.message,
    type: input.type ?? 'info',
    category: input.category,
    adminId: input.adminId,
    entityType: input.entityType,
    entityId: input.entityId,
    isRead: false,
  });
}
