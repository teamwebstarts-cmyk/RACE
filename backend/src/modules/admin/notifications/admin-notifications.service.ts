import { AdminNotificationModel } from '../models/admin-notification.model';
import { paginate } from '../shared/pagination';

export const adminNotificationsService = {
  async list(filters: { page?: number; pageSize?: number; unreadOnly?: boolean }) {
    const query: Record<string, unknown> = {};
    if (filters.unreadOnly) query.isRead = false;
    return paginate(AdminNotificationModel, query, filters, (doc) => ({
      id: doc._id.toString(),
      title: doc.title,
      message: doc.message,
      type: doc.type,
      category: doc.category,
      isRead: doc.isRead,
      createdAt: doc.createdAt.toISOString(),
    }));
  },

  async getUnreadCount() {
    return AdminNotificationModel.countDocuments({ isRead: false });
  },

  async markRead(id: string) {
    await AdminNotificationModel.findByIdAndUpdate(id, { isRead: true });
  },

  async markAllRead() {
    await AdminNotificationModel.updateMany({ isRead: false }, { isRead: true });
  },
};
