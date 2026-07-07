import { Router } from 'express';

import { authMiddleware } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validation.middleware';
import { bookingPaymentController } from './booking-payment.controller';
import {
  initiateBookingPaymentSchema,
  verifyBookingPaymentSchema,
} from './booking-payment.validator';

const router = Router();

router.use(authMiddleware);

router.post('/advance', validate(initiateBookingPaymentSchema), bookingPaymentController.initiateAdvance);
router.post(
  '/advance/verify',
  validate(verifyBookingPaymentSchema),
  bookingPaymentController.verifyAdvance,
);
router.post('/final', validate(initiateBookingPaymentSchema), bookingPaymentController.initiateFinal);
router.post(
  '/final/verify',
  validate(verifyBookingPaymentSchema),
  bookingPaymentController.verifyFinal,
);

export default router;
