import { Router } from 'express';

import { AdminPermission } from '../shared/rbac';
import { adminAuthMiddleware } from '../middleware/admin-auth.middleware';
import { requireAdminPermission } from '../middleware/require-permission.middleware';
import { adminSettingsController } from '../controllers/settings.controller';

const router = Router();

router.get(
  '/settings',
  adminAuthMiddleware,
  requireAdminPermission(AdminPermission.SETTINGS_VIEW),
  adminSettingsController.get,
);
router.put(
  '/settings',
  adminAuthMiddleware,
  requireAdminPermission(AdminPermission.SETTINGS_MANAGE),
  adminSettingsController.update,
);

export default router;
