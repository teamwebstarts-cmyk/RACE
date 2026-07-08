import { Router } from 'express';

import { authMiddleware } from '../../../middleware/auth.middleware';
import { validate } from '../../../middleware/validation.middleware';
import { towingBookingController } from './towing-booking.controller';
import {
  cancelTowingBookingSchema,
  createTowingBookingSchema,
  towingBookingStatusQuerySchema,
  updateTowingBookingStatusSchema,
} from './towing-booking.validator';
import { submitServiceBookingRatingSchema } from '../shared/booking-rating.validator';

const router = Router();

router.use(authMiddleware);

router.post('/', validate(createTowingBookingSchema), towingBookingController.create);
router.get('/', validate(towingBookingStatusQuerySchema, 'query'), towingBookingController.list);
router.get('/:id/tracking', towingBookingController.getTracking);
router.get('/:id/cancel-preview', towingBookingController.getCancelPreview);
router.post('/:id/cancel', validate(cancelTowingBookingSchema), towingBookingController.cancel);
router.post(
  '/:id/rating',
  validate(submitServiceBookingRatingSchema),
  towingBookingController.submitRating,
);
router.get('/:id', towingBookingController.getById);
router.patch(
  '/:id/status',
  validate(updateTowingBookingStatusSchema),
  towingBookingController.updateStatus,
);

export default router;
