import { Router } from 'express';

import { AdminPermission } from '../../../services/src/admin/rbac';
import { adminAuthMiddleware } from '../../../middleware/src/adminAuth';
import { requireAdminPermission } from '../../../middleware/src/requirePermission';
import { adminNotificationsController } from './notifications';

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
