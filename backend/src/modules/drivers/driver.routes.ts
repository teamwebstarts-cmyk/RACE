import { Router } from 'express';

import { authMiddleware } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validation.middleware';
import { driverController } from './driver.controller';
import {
  driverBookingsQuerySchema,
  updateDriverAvailabilitySchema,
  updateDriverBookingStatusSchema,
  updateDriverLocationSchema,
} from './driver.validator';

const router = Router();

router.use(authMiddleware);
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

export default router;
