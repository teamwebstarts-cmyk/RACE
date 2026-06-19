import { z } from 'zod';

export const updateNotificationPrefsSchema = z.object({
  pushEnabled: z.boolean().optional(),
  smsEnabled: z.boolean().optional(),
  emailEnabled: z.boolean().optional(),
  bookingUpdates: z.boolean().optional(),
  promotions: z.boolean().optional(),
  serviceLaunches: z.boolean().optional(),
});

export type UpdateNotificationPrefsDto = z.infer<typeof updateNotificationPrefsSchema>;

export interface NotificationResponseDto {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  metadata?: Record<string, string>;
  createdAt: string;
}

export interface NotificationPrefsDto {
  pushEnabled: boolean;
  smsEnabled: boolean;
  emailEnabled: boolean;
  bookingUpdates: boolean;
  promotions: boolean;
  serviceLaunches: boolean;
}
