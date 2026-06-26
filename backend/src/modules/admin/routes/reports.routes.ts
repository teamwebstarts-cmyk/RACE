import { Router } from 'express';

import { AdminPermission } from '../shared/rbac';
import { adminAuthMiddleware } from '../middleware/admin-auth.middleware';
import { requireAdminPermission } from '../middleware/require-permission.middleware';
import { adminReportsController } from '../controllers/reports.controller';

const router = Router();

router.get(
  '/reports',
  adminAuthMiddleware,
  requireAdminPermission(AdminPermission.REPORTS_VIEW),
  adminReportsController.getReports,
);

export default router;
