import { Router } from 'express';

import { authMiddleware } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validation.middleware';
import { locationController } from './location.controller';
import { createLocationSchema, updateLocationSchema } from './location.validator';

const router = Router();

router.use(authMiddleware);

router.get('/', locationController.list);
router.post('/', validate(createLocationSchema), locationController.create);
router.put('/:id', validate(updateLocationSchema), locationController.update);
router.delete('/:id', locationController.remove);

export default router;
