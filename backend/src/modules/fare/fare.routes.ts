import { Router } from 'express';

import { validate } from '../../middleware/validation.middleware';
import { fareController } from './fare.controller';
import { driverFareQuerySchema, towingFareQuerySchema } from './fare.validator';

const router = Router();

router.get('/towing', validate(towingFareQuerySchema, 'query'), fareController.estimateTowing);
router.get('/driver', validate(driverFareQuerySchema, 'query'), fareController.estimateDriver);

export default router;
