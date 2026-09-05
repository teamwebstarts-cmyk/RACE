import { Router } from 'express';

import { authMiddleware } from '../../middleware/src/auth';
import { validate } from '../../middleware/src/validation';
import { bookingController } from './booking';
import { combinedBookingListQuerySchema } from '../../services/src/combinedBookingValidator';

const router = Router();

router.use(authMiddleware);

/** Combined list of towing + driver bookings for the authenticated customer. */
router.get('/', validate(combinedBookingListQuerySchema, 'query'), bookingController.list);

export default router;
