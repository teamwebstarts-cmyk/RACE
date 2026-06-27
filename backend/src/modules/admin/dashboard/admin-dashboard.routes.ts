import { Router } from 'express';

import { AdminPermission } from '../shared/rbac';
import { adminAuthMiddleware } from '../middleware/admin-auth.middleware';
import { requireAdminPermission } from '../middleware/require-permission.middleware';
import { adminDashboardController } from './admin-dashboard.controller';

const router = Router();

router.use(adminAuthMiddleware);
router.get('/', requireAdminPermission(AdminPermission.DASHBOARD_VIEW), adminDashboardController.getDashboard);

export default router;
