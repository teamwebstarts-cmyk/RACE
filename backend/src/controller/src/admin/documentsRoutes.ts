import { Router } from 'express';

import { AdminPermission } from '../../../services/src/admin/rbac';
import { adminAuthMiddleware } from '../../../middleware/src/adminAuth';
import { requireAdminPermission } from '../../../middleware/src/requirePermission';
import { adminDocumentsController } from './documents';

const router = Router();

router.get(
  '/documents/vendor/:vendorId/:docKey',
  adminAuthMiddleware,
  requireAdminPermission(AdminPermission.VENDORS_VIEW),
  adminDocumentsController.getVendorDocument,
);
router.get(
  '/documents/driver/:driverId/:docKey',
  adminAuthMiddleware,
  requireAdminPermission(AdminPermission.DRIVERS_VIEW),
  adminDocumentsController.getDriverDocument,
);

export default router;
