import { Router } from 'express';

import { vehicleController } from './vehicle.controller';
import {
  createVehicleSchema,
  updateVehicleSchema,
  vehicleIdSchema,
} from './vehicle.validator';
import { validate } from '../../middleware/validation.middleware';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

router.get('/:id/verify', validate(vehicleIdSchema, 'params'), vehicleController.verifyQr);

router.use(authMiddleware);

router.post('/', validate(createVehicleSchema), vehicleController.create);
router.get('/', vehicleController.list);
router.get('/:id', validate(vehicleIdSchema, 'params'), vehicleController.getById);
router.put(
  '/:id',
  validate(vehicleIdSchema, 'params'),
  validate(updateVehicleSchema),
  vehicleController.update,
);
router.delete('/:id', validate(vehicleIdSchema, 'params'), vehicleController.remove);

export default router;
