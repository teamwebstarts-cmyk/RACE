import { Router } from 'express';
import { z } from 'zod';

import { authMiddleware } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validation.middleware';
import { vehicleIdSchema } from '../vehicles/vehicle.validator';
import { vendorController } from './vendor.controller';
import {
  adminListVendorsSchema,
  reviewDocumentSchema,
} from './vendor.validator';

const adminNoteSchema = z.object({
  reviewNotes: z.string().max(500).optional(),
});

const router = Router();

router.use(authMiddleware);
router.use(requireRole('admin'));

router.get('/', validate(adminListVendorsSchema, 'query'), vendorController.listForAdmin);
router.get('/:id', validate(vehicleIdSchema, 'params'), vendorController.getByIdForAdmin);
router.post(
  '/:id/approve',
  validate(vehicleIdSchema, 'params'),
  validate(adminNoteSchema),
  vendorController.approve,
);
router.post(
  '/:id/reject',
  validate(vehicleIdSchema, 'params'),
  validate(adminNoteSchema),
  vendorController.reject,
);
router.post(
  '/:id/request-resubmission',
  validate(vehicleIdSchema, 'params'),
  validate(adminNoteSchema),
  vendorController.requestResubmission,
);
router.post(
  '/:id/documents/:documentType/review',
  validate(vehicleIdSchema, 'params'),
  validate(reviewDocumentSchema),
  vendorController.reviewDocument,
);

export default router;
