import { notificationRepository } from './notificationRepository';
import { NotificationPrefsModel, type INotificationPrefs } from '../../models/src/notificationPrefs';
import type { INotification } from '../../models/src/notification';
import type {
  NotificationPrefsDto,
  NotificationResponseDto,
  UpdateNotificationPrefsDto,
} from './notificationValidator';
import type { NotificationType } from '../../models/src/notification';

function mapNotification(n: INotification): NotificationResponseDto {
  return {
    id: n.id,
    type: (n.type as NotificationType) ?? 'PROMOTION',
    title: n.title,
    message: n.message,
    isRead: n.isRead,
    metadata: n.metadata as Record<string, string> | undefined,
    createdAt: n.createdAt.toISOString(),
  };
}

function mapPrefs(prefs: INotificationPrefs): NotificationPrefsDto {
  return {
    pushEnabled: prefs.pushEnabled,
    smsEnabled: prefs.smsEnabled,
    emailEnabled: prefs.emailEnabled,
    bookingUpdates: prefs.bookingUpdates,
    promotions: prefs.promotions,
    serviceLaunches: prefs.serviceLaunches,
  };
}

const DEFAULT_PREFS = {
  pushEnabled: true,
  smsEnabled: true,
  emailEnabled: false,
  bookingUpdates: true,
  promotions: true,
  serviceLaunches: true,
};

export class NotificationService {
  async createForUser(
    userId: string,
    data: {
      type: NotificationType;
      title: string;
      message: string;
      metadata?: Record<string, string>;
    },
  ): Promise<NotificationResponseDto> {
    const notification = await notificationRepository.create({
      userId,
      type: data.type,
      title: data.title,
      message: data.message,
      metadata: data.metadata,
    });
    return mapNotification(notification);
  }

  async listForUser(userId: string): Promise<NotificationResponseDto[]> {
    const notifications = await notificationRepository.findByUserId(userId);
    return notifications.map(mapNotification);
  }

  async markAllRead(userId: string): Promise<{ updated: number }> {
    const updated = await notificationRepository.markAllRead(userId);
    return { updated };
  }

  async getUnreadCount(userId: string): Promise<number> {
    return notificationRepository.countUnread(userId);
  }

  async getPrefs(userId: string): Promise<NotificationPrefsDto> {
    let prefs = await NotificationPrefsModel.findOne({ userId });
    if (!prefs) {
      prefs = await NotificationPrefsModel.create({ userId, ...DEFAULT_PREFS });
    }
    return mapPrefs(prefs);
  }

  async updatePrefs(
    userId: string,
    dto: UpdateNotificationPrefsDto,
  ): Promise<NotificationPrefsDto> {
    const prefs = await NotificationPrefsModel.findOneAndUpdate(
      { userId },
      { $set: dto, $setOnInsert: { userId, ...DEFAULT_PREFS } },
      { new: true, upsert: true },
    );
    return mapPrefs(prefs!);
  }

  async seedWelcomeNotifications(userId: string): Promise<void> {
    const existing = await notificationRepository.findByUserId(userId);
    if (existing.length > 0) return;

    const samples = [
      {
        type: 'PROMOTION' as NotificationType,
        title: 'Special Offer!',
        message: 'Get 20% off your first towing service. Use code RACE20.',
      },
      {
        type: 'SERVICE_RATING' as NotificationType,
        title: 'Rate Your Experience',
        message: 'How was your recent service? Share your feedback.',
      },
      {
        type: 'PAYMENT_SUCCESS' as NotificationType,
        title: 'Payment Successful',
        message: '₹899 paid for booking #RACE78291 via UPI.',
      },
    ];

    for (const sample of samples) {
      await this.createForUser(userId, sample);
    }
  }
}

export const notificationService = new NotificationService();
