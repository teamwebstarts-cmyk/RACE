import { Router } from 'express';

import { validate } from '../../middleware/validation.middleware';
import { vehicleController } from './vehicle.controller';
import { vehicleIdSchema } from './vehicle.validator';

const router = Router();

router.get('/:id', validate(vehicleIdSchema, 'params'), vehicleController.verifyQr);
router.get('/:id/metadata', validate(vehicleIdSchema, 'params'), vehicleController.getQrMetadata);

export default router;
