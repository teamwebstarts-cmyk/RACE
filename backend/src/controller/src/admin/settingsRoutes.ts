import { Router } from 'express';

import { AdminPermission } from '../../../services/src/admin/rbac';
import { adminAuthMiddleware } from '../../../middleware/src/adminAuth';
import { requireAdminPermission } from '../../../middleware/src/requirePermission';
import { adminSettingsController } from './settings';

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
