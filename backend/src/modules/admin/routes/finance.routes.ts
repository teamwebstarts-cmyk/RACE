import { Router } from 'express';

import { AdminPermission } from '../shared/rbac';
import { adminAuthMiddleware } from '../middleware/admin-auth.middleware';
import { requireAdminPermission } from '../middleware/require-permission.middleware';
import { adminFinanceController } from '../controllers/finance.controller';

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
