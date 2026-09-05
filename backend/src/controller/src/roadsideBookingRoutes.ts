import { Router } from 'express';

import { authMiddleware } from '../../middleware/src/auth';
import { validate } from '../../middleware/src/validation';
import { roadsideBookingController } from './roadsideBooking';
import { createRoadsideBookingSchema } from '../../services/src/roadsideBookingValidator';

const router = Router();

router.get('/availability', roadsideBookingController.getAvailability);

router.use(authMiddleware);

router.post('/', validate(createRoadsideBookingSchema), roadsideBookingController.create);

export default router;
