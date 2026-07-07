import { Router } from 'express';

import { authMiddleware } from '../../../middleware/auth.middleware';
import { validate } from '../../../middleware/validation.middleware';
import { driverBookingController } from './driver-booking.controller';
import {
  cancelDriverBookingSchema,
  createDriverBookingSchema,
  driverBookingStatusQuerySchema,
  updateDriverBookingStatusSchema,
} from './driver-booking.validator';
import { submitServiceBookingRatingSchema } from '../shared/booking-rating.validator';

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
