import { NotificationModel, type INotification, type NotificationType } from './notification.model';

export class NotificationRepository {
  async create(data: Partial<INotification>): Promise<INotification> {
    return NotificationModel.create(data);
  }

  async findByUser(userId: string): Promise<INotification[]> {
    return NotificationModel.find({ userId }).sort({ createdAt: -1 });
  }

  async markAllRead(userId: string): Promise<number> {
    const result = await NotificationModel.updateMany({ userId, isRead: false }, { isRead: true });
    return result.modifiedCount;
  }

  async markRead(userId: string, notificationId: string): Promise<INotification | null> {
    return NotificationModel.findOneAndUpdate(
      { _id: notificationId, userId },
      { isRead: true },
      { new: true },
    );
  }

  async countUnread(userId: string): Promise<number> {
    return NotificationModel.countDocuments({ userId, isRead: false });
  }
}

export const notificationRepository = new NotificationRepository();

export type { NotificationType };
