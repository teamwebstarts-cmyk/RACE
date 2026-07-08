import { Router } from 'express';

import { authMiddleware } from '../../../middleware/auth.middleware';
import { validate } from '../../../middleware/validation.middleware';
import { roadsideBookingController } from './roadside-booking.controller';
import { createRoadsideBookingSchema } from './roadside-booking.validator';

const router = Router();

router.get('/availability', roadsideBookingController.getAvailability);

router.use(authMiddleware);

router.post('/', validate(createRoadsideBookingSchema), roadsideBookingController.create);

export default router;
