import { Router } from 'express';

import { authMiddleware } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validation.middleware';
import { vendorController } from './vendor.controller';
import { registerVendorSchema, reviewVendorSchema } from './vendor.validator';
import { vehicleIdSchema } from '../vehicles/vehicle.validator';

const router = Router();

router.use(authMiddleware);

router.post('/register', validate(registerVendorSchema), vendorController.register);
router.get('/status', vendorController.getStatus);

router.get('/admin/pending', vendorController.listPending);
router.put(
  '/admin/:id/review',
  validate(vehicleIdSchema, 'params'),
  validate(reviewVendorSchema),
  vendorController.review,
);

export default router;
