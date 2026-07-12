import { Router } from 'express';

import { AdminPermission } from '../../../services/src/admin/rbac';
import { adminAuthMiddleware } from '../../../middleware/src/adminAuth';
import { requireAdminPermission } from '../../../middleware/src/requirePermission';
import { adminVendorsController } from './vendors';

const router = Router();

router.get(
  '/vendors/counts',
  adminAuthMiddleware,
  requireAdminPermission(AdminPermission.VENDORS_VIEW),
  adminVendorsController.getCounts,
);
router.get(
  '/vendors',
  adminAuthMiddleware,
  requireAdminPermission(AdminPermission.VENDORS_VIEW),
  adminVendorsController.list,
);
router.get(
  '/vendors/:id',
  adminAuthMiddleware,
  requireAdminPermission(AdminPermission.VENDORS_VIEW),
  adminVendorsController.getById,
);
router.post(
  '/vendors',
  adminAuthMiddleware,
  requireAdminPermission(AdminPermission.VENDORS_MANAGE),
  adminVendorsController.create,
);
router.post(
  '/vendors/:id/approve',
  adminAuthMiddleware,
  requireAdminPermission(AdminPermission.VENDORS_APPROVE),
  adminVendorsController.approve,
);
router.post(
  '/vendors/:id/reject',
  adminAuthMiddleware,
  requireAdminPermission(AdminPermission.VENDORS_APPROVE),
  adminVendorsController.reject,
);
router.patch(
  '/vendors/:id/documents/:docKey',
  adminAuthMiddleware,
  requireAdminPermission(AdminPermission.VENDORS_APPROVE),
  adminVendorsController.reviewDocument,
);
router.patch(
  '/vendors/:id',
  adminAuthMiddleware,
  requireAdminPermission(AdminPermission.VENDORS_MANAGE),
  adminVendorsController.update,
);
router.delete(
  '/vendors/:id',
  adminAuthMiddleware,
  requireAdminPermission(AdminPermission.VENDORS_MANAGE),
  adminVendorsController.remove,
);
router.post(
  '/vendors/:id/suspend',
  adminAuthMiddleware,
  requireAdminPermission(AdminPermission.VENDORS_MANAGE),
  adminVendorsController.suspend,
);
router.post(
  '/vendors/:id/assign-drivers',
  adminAuthMiddleware,
  requireAdminPermission(AdminPermission.VENDORS_MANAGE),
  adminVendorsController.assignDrivers,
);
router.post(
  '/vendors/:id/unassign-drivers/:driverId',
  adminAuthMiddleware,
  requireAdminPermission(AdminPermission.VENDORS_MANAGE),
  adminVendorsController.unassignDriver,
);
router.get(
  '/vendors/:id/vehicles',
  adminAuthMiddleware,
  requireAdminPermission(AdminPermission.VENDORS_VIEW),
  adminVendorsController.listVehicles,
);
router.post(
  '/vendors/:id/vehicles',
  adminAuthMiddleware,
  requireAdminPermission(AdminPermission.VENDORS_MANAGE),
  adminVendorsController.createVehicle,
);
router.get(
  '/vendors/:id/drivers',
  adminAuthMiddleware,
  requireAdminPermission(AdminPermission.VENDORS_VIEW),
  adminVendorsController.listFleetDrivers,
);
router.post(
  '/vendors/:id/drivers',
  adminAuthMiddleware,
  requireAdminPermission(AdminPermission.VENDORS_MANAGE),
  adminVendorsController.createFleetDriver,
);
router.delete(
  '/vendors/:id/drivers/:driverId',
  adminAuthMiddleware,
  requireAdminPermission(AdminPermission.VENDORS_MANAGE),
  adminVendorsController.removeFleetDriver,
);

export default router;
