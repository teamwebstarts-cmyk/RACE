import { Router } from 'express';

import { authMiddleware } from '../../middleware/src/auth';
import { requireRole } from '../../middleware/src/role';
import { validate } from '../../middleware/src/validation';
import { driverController } from './driver';
import { registerDriverSelfSchema } from '../../services/src/driverSelf';
import {
  driverBookingsQuerySchema,
  driverBookingActionSchema,
  updateDriverAvailabilitySchema,
  updateDriverBookingStatusSchema,
  updateDriverLocationSchema,
} from '../../services/src/driverValidator';

const router = Router();

router.use(authMiddleware);

// Self registration — any authenticated user (typically customer after OTP) can become a driver
router.post(
  '/register',
  validate(registerDriverSelfSchema),
  driverController.registerSelf,
);

router.use(requireRole('driver'));

router.patch(
  '/availability',
  validate(updateDriverAvailabilitySchema),
  driverController.updateAvailability,
);
router.patch(
  '/location',
  validate(updateDriverLocationSchema),
  driverController.updateLocation,
);
router.get(
  '/bookings',
  validate(driverBookingsQuerySchema, 'query'),
  driverController.listBookings,
);
router.get('/bookings/active', driverController.getActiveBooking);
router.patch(
  '/bookings/:id/status',
  validate(updateDriverBookingStatusSchema),
  driverController.updateBookingStatus,
);
router.post(
  '/bookings/:id/accept',
  validate(driverBookingActionSchema),
  driverController.acceptBooking,
);
router.post(
  '/bookings/:id/reject',
  validate(driverBookingActionSchema),
  driverController.rejectBooking,
);

export default router;
