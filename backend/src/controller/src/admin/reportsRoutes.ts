import { Router } from 'express';

import { AdminPermission } from '../../../services/src/admin/rbac';
import { adminAuthMiddleware } from '../../../middleware/src/adminAuth';
import { requireAdminPermission } from '../../../middleware/src/requirePermission';
import { adminReportsController } from './reports';

const router = Router();

router.get(
  '/reports',
  adminAuthMiddleware,
  requireAdminPermission(AdminPermission.REPORTS_VIEW),
  adminReportsController.getReports,
);

export default router;
