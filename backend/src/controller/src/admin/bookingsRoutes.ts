import { Router } from 'express';

import { AdminPermission } from '../../../services/src/admin/rbac';
import { adminAuthMiddleware } from '../../../middleware/src/adminAuth';
import { requireAdminPermission } from '../../../middleware/src/requirePermission';
import { validate } from '../../../middleware/src/validation';
import { adminBookingsController } from './bookings';
import { adminVehiclesController } from './vehicles';
import {
  assignServiceBookingDriverSchema,
  cancelServiceBookingSchema,
} from '../../../services/src/admin/adminServiceBookingsValidator';

const router = Router();

router.get(
  '/bookings',
  adminAuthMiddleware,
  requireAdminPermission(AdminPermission.BOOKINGS_VIEW),
  adminBookingsController.list,
);
router.get(
  '/bookings/counts',
  adminAuthMiddleware,
  requireAdminPermission(AdminPermission.BOOKINGS_VIEW),
  adminBookingsController.getCounts,
);
router.get(
  '/bookings/:id',
  adminAuthMiddleware,
  requireAdminPermission(AdminPermission.BOOKINGS_VIEW),
  adminBookingsController.getById,
);
router.post(
  '/bookings',
  adminAuthMiddleware,
  requireAdminPermission(AdminPermission.BOOKINGS_MANAGE),
  adminBookingsController.create,
);
router.patch(
  '/bookings/:id',
  adminAuthMiddleware,
  requireAdminPermission(AdminPermission.BOOKINGS_MANAGE),
  adminBookingsController.update,
);
router.delete(
  '/bookings/:id',
  adminAuthMiddleware,
  requireAdminPermission(AdminPermission.BOOKINGS_MANAGE),
  adminBookingsController.remove,
);
router.post(
  '/bookings/:id/assign-vendor',
  adminAuthMiddleware,
  requireAdminPermission(AdminPermission.BOOKINGS_MANAGE),
  adminBookingsController.assignVendor,
);
router.post(
  '/bookings/:id/assign-driver',
  adminAuthMiddleware,
  requireAdminPermission(AdminPermission.BOOKINGS_MANAGE),
  adminBookingsController.assignDriver,
);
router.patch(
  '/bookings/:id/assign-driver',
  adminAuthMiddleware,
  requireAdminPermission(AdminPermission.BOOKINGS_MANAGE),
  validate(assignServiceBookingDriverSchema),
  adminBookingsController.assignServiceDriver,
);
router.post(
  '/bookings/:id/cancel',
  adminAuthMiddleware,
  requireAdminPermission(AdminPermission.BOOKINGS_MANAGE),
  validate(cancelServiceBookingSchema),
  adminBookingsController.cancelServiceBooking,
);
router.post(
  '/bookings/:id/status',
  adminAuthMiddleware,
  requireAdminPermission(AdminPermission.BOOKINGS_MANAGE),
  adminBookingsController.updateStatus,
);
router.patch(
  '/bookings/:id/status',
  adminAuthMiddleware,
  requireAdminPermission(AdminPermission.BOOKINGS_MANAGE),
  adminBookingsController.updateStatus,
);
router.patch(
  '/vehicles/:id',
  adminAuthMiddleware,
  requireAdminPermission(AdminPermission.VENDORS_MANAGE),
  adminVehiclesController.update,
);
router.delete(
  '/vehicles/:id',
  adminAuthMiddleware,
  requireAdminPermission(AdminPermission.VENDORS_MANAGE),
  adminVehiclesController.remove,
);

export default router;
