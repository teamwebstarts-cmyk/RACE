import { Router } from 'express';

import { authMiddleware } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validation.middleware';
import { bookingController } from './booking.controller';
import { createBookingSchema, submitRatingSchema } from './booking.validator';

const router = Router();

router.use(authMiddleware);

router.post('/', validate(createBookingSchema), bookingController.create);
router.get('/', bookingController.list);
router.get('/:id', bookingController.getById);
router.get('/:id/tracking', bookingController.getTracking);
router.post('/:id/rating', validate(submitRatingSchema), bookingController.submitRating);
router.post('/:id/advance', bookingController.advanceDemo);

export default router;
