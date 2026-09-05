import { Router } from 'express';

import { authMiddleware } from '../../middleware/src/auth';
import { validate } from '../../middleware/src/validation';
import { towingBookingController } from './towingBooking';
import {
  cancelTowingBookingSchema,
  createTowingBookingSchema,
  towingBookingStatusQuerySchema,
  updateTowingBookingStatusSchema,
} from '../../services/src/towingBookingValidator';
import { submitServiceBookingRatingSchema } from '../../services/src/bookingRatingValidator';

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
