import { Router } from 'express';

import { authMiddleware } from '../../middleware/src/auth';
import { validate } from '../../middleware/src/validation';
import { locationController } from './location';
import { createLocationSchema, updateLocationSchema } from '../../services/src/locationValidator';

const router = Router();

router.use(authMiddleware);

router.get('/', locationController.list);
router.post('/', validate(createLocationSchema), locationController.create);
router.put('/:id', validate(updateLocationSchema), locationController.update);
router.delete('/:id', locationController.remove);

export default router;
