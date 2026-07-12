import { Router } from 'express';

import { validate } from '../../middleware/src/validation';
import { vehicleController } from './vehicle';
import { vehicleIdSchema } from '../../services/src/vehicleValidator';

const router = Router();

router.get('/:id', validate(vehicleIdSchema, 'params'), vehicleController.verifyQr);
router.get('/:id/metadata', validate(vehicleIdSchema, 'params'), vehicleController.getQrMetadata);

export default router;
