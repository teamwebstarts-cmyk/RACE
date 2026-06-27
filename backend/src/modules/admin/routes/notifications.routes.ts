import { Router } from 'express';

import { AdminPermission } from '../shared/rbac';
import { adminAuthMiddleware } from '../middleware/admin-auth.middleware';
import { requireAdminPermission } from '../middleware/require-permission.middleware';
import { adminNotificationsController } from '../controllers/notifications.controller';

const router = Router();

router.get(
  '/notifications',
  adminAuthMiddleware,
  requireAdminPermission(AdminPermission.NOTIFICATIONS_VIEW),
  adminNotificationsController.list,
);
router.get(
  '/notifications/unread-count',
  adminAuthMiddleware,
  requireAdminPermission(AdminPermission.NOTIFICATIONS_VIEW),
  adminNotificationsController.getUnreadCount,
);
router.patch(
  '/notifications/:id/read',
  adminAuthMiddleware,
  requireAdminPermission(AdminPermission.NOTIFICATIONS_VIEW),
  adminNotificationsController.markRead,
);
router.post(
  '/notifications/read-all',
  adminAuthMiddleware,
  requireAdminPermission(AdminPermission.NOTIFICATIONS_VIEW),
  adminNotificationsController.markAllRead,
);

export default router;
