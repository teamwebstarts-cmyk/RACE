import { Router } from 'express';

import { AdminPermission } from '../../../services/src/admin/rbac';
import { adminAuthMiddleware } from '../../../middleware/src/adminAuth';
import { requireAdminPermission } from '../../../middleware/src/requirePermission';
import { adminDashboardController } from './adminDashboard';

const router = Router();

router.use(adminAuthMiddleware);
router.get('/', requireAdminPermission(AdminPermission.DASHBOARD_VIEW), adminDashboardController.getDashboard);

export default router;
