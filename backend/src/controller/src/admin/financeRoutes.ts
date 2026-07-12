import { Router } from 'express';

import { AdminPermission } from '../../../services/src/admin/rbac';
import { adminAuthMiddleware } from '../../../middleware/src/adminAuth';
import { requireAdminPermission } from '../../../middleware/src/requirePermission';
import { adminFinanceController } from './finance';

const router = Router();

router.get(
  '/transactions',
  adminAuthMiddleware,
  requireAdminPermission(AdminPermission.FINANCE_VIEW),
  adminFinanceController.listTransactions,
);
router.get(
  '/transactions/summary',
  adminAuthMiddleware,
  requireAdminPermission(AdminPermission.FINANCE_VIEW),
  adminFinanceController.getSummary,
);

export default router;
