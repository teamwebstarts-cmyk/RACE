import { Router } from 'express';

import { AdminPermission } from '../../../services/src/admin/rbac';
import { adminAuthMiddleware } from '../../../middleware/src/adminAuth';
import { requireAdminPermission } from '../../../middleware/src/requirePermission';
import { adminUsersController, adminActivityController } from './admins';

const router = Router();

router.get(
  '/admins',
  adminAuthMiddleware,
  requireAdminPermission(AdminPermission.ADMIN_USERS_VIEW),
  adminUsersController.list,
);
router.post(
  '/admins',
  adminAuthMiddleware,
  requireAdminPermission(AdminPermission.ADMIN_USERS_MANAGE),
  adminUsersController.create,
);
router.patch(
  '/admins/:id',
  adminAuthMiddleware,
  requireAdminPermission(AdminPermission.ADMIN_USERS_MANAGE),
  adminUsersController.update,
);
router.delete(
  '/admins/:id',
  adminAuthMiddleware,
  requireAdminPermission(AdminPermission.ADMIN_USERS_MANAGE),
  adminUsersController.remove,
);
router.get(
  '/activity-logs',
  adminAuthMiddleware,
  requireAdminPermission(AdminPermission.AUDIT_LOGS_VIEW),
  adminActivityController.list,
);

export default router;
