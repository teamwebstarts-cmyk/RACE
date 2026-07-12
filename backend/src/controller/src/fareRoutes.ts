import { Router } from 'express';

import { validate } from '../../middleware/src/validation';
import { fareController } from './fare';
import { driverFareQuerySchema, towingFareQuerySchema } from '../../services/src/fareValidator';

const router = Router();

router.get('/towing', validate(towingFareQuerySchema, 'query'), fareController.estimateTowing);
router.get('/driver', validate(driverFareQuerySchema, 'query'), fareController.estimateDriver);

export default router;
