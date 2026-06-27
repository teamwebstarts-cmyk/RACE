import { Router } from 'express';

import { AdminPermission } from '../shared/rbac';
import { adminAuthMiddleware } from '../middleware/admin-auth.middleware';
import { requireAdminPermission } from '../middleware/require-permission.middleware';
import { adminCustomersController } from '../controllers/customers.controller';

const router = Router();

router.get(
  '/customers/export/csv',
  adminAuthMiddleware,
  requireAdminPermission(AdminPermission.CUSTOMERS_VIEW),
  adminCustomersController.exportCsv,
);
router.get(
  '/customers/cities',
  adminAuthMiddleware,
  requireAdminPermission(AdminPermission.CUSTOMERS_VIEW),
  adminCustomersController.getCities,
);
router.get(
  '/customers',
  adminAuthMiddleware,
  requireAdminPermission(AdminPermission.CUSTOMERS_VIEW),
  adminCustomersController.list,
);
router.get(
  '/customers/:id',
  adminAuthMiddleware,
  requireAdminPermission(AdminPermission.CUSTOMERS_VIEW),
  adminCustomersController.getById,
);
router.post(
  '/customers',
  adminAuthMiddleware,
  requireAdminPermission(AdminPermission.CUSTOMERS_MANAGE),
  adminCustomersController.create,
);
router.patch(
  '/customers/:id/status',
  adminAuthMiddleware,
  requireAdminPermission(AdminPermission.CUSTOMERS_MANAGE),
  adminCustomersController.setStatus,
);
router.patch(
  '/customers/:id',
  adminAuthMiddleware,
  requireAdminPermission(AdminPermission.CUSTOMERS_MANAGE),
  adminCustomersController.update,
);
router.delete(
  '/customers/:id',
  adminAuthMiddleware,
  requireAdminPermission(AdminPermission.CUSTOMERS_MANAGE),
  adminCustomersController.remove,
);

export default router;
