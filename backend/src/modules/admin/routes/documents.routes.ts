import { Router } from 'express';

import { AdminPermission } from '../shared/rbac';
import { adminAuthMiddleware } from '../middleware/admin-auth.middleware';
import { requireAdminPermission } from '../middleware/require-permission.middleware';
import { adminDocumentsController } from '../controllers/documents.controller';

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
