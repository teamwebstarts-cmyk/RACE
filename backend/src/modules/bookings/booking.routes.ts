import { Router } from 'express';

import { authMiddleware } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validation.middleware';
import { bookingController } from './booking.controller';
import { combinedBookingListQuerySchema } from './combined-booking.validator';

const router = Router();

router.use(authMiddleware);

/** Combined list of towing + driver bookings for the authenticated customer. */
router.get('/', validate(combinedBookingListQuerySchema, 'query'), bookingController.list);

export default router;
