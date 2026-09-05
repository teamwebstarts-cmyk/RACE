import { Router } from 'express';

import { AdminPermission } from '../../../services/src/admin/rbac';
import { adminAuthMiddleware } from '../../../middleware/src/adminAuth';
import { requireAdminPermission } from '../../../middleware/src/requirePermission';
import { adminDriversController } from './drivers';

const router = Router();

router.get(
  '/drivers/counts',
  adminAuthMiddleware,
  requireAdminPermission(AdminPermission.DRIVERS_VIEW),
  adminDriversController.getCounts,
);
router.get(
  '/drivers',
  adminAuthMiddleware,
  requireAdminPermission(AdminPermission.DRIVERS_VIEW),
  adminDriversController.list,
);
router.get(
  '/drivers/available',
  adminAuthMiddleware,
  requireAdminPermission(AdminPermission.DRIVERS_VIEW),
  adminDriversController.listAvailable,
);
router.get(
  '/drivers/:id',
  adminAuthMiddleware,
  requireAdminPermission(AdminPermission.DRIVERS_VIEW),
  adminDriversController.getById,
);
router.post(
  '/drivers',
  adminAuthMiddleware,
  requireAdminPermission(AdminPermission.DRIVERS_MANAGE),
  adminDriversController.create,
);
router.patch(
  '/drivers/:id',
  adminAuthMiddleware,
  requireAdminPermission(AdminPermission.DRIVERS_MANAGE),
  adminDriversController.update,
);
router.delete(
  '/drivers/:id',
  adminAuthMiddleware,
  requireAdminPermission(AdminPermission.DRIVERS_MANAGE),
  adminDriversController.remove,
);
router.post(
  '/drivers/:id/approve',
  adminAuthMiddleware,
  requireAdminPermission(AdminPermission.DRIVERS_APPROVE),
  adminDriversController.approve,
);
router.post(
  '/drivers/:id/reject',
  adminAuthMiddleware,
  requireAdminPermission(AdminPermission.DRIVERS_APPROVE),
  adminDriversController.reject,
);
router.patch(
  '/drivers/:id/documents/:documentId',
  adminAuthMiddleware,
  requireAdminPermission(AdminPermission.DRIVERS_APPROVE),
  adminDriversController.reviewDocument,
);

export default router;
