import { Router } from 'express';

import { authMiddleware } from '../../middleware/src/auth';
import { validate } from '../../middleware/src/validation';
import { driverBookingController } from './driverBooking';
import {
  cancelDriverBookingSchema,
  createDriverBookingSchema,
  driverBookingStatusQuerySchema,
  updateDriverBookingStatusSchema,
} from '../../services/src/driverBookingValidator';
import { submitServiceBookingRatingSchema } from '../../services/src/bookingRatingValidator';

const router = Router();

router.use(authMiddleware);

router.post('/', validate(createDriverBookingSchema), driverBookingController.create);
router.get('/', validate(driverBookingStatusQuerySchema, 'query'), driverBookingController.list);
router.get('/:id/tracking', driverBookingController.getTracking);
router.get('/:id/cancel-preview', driverBookingController.getCancelPreview);
router.post('/:id/cancel', validate(cancelDriverBookingSchema), driverBookingController.cancel);
router.post(
  '/:id/rating',
  validate(submitServiceBookingRatingSchema),
  driverBookingController.submitRating,
);
router.get('/:id', driverBookingController.getById);
router.patch(
  '/:id/status',
  validate(updateDriverBookingStatusSchema),
  driverBookingController.updateStatus,
);

export default router;
