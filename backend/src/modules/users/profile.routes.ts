import { Router } from 'express';

import { profileController } from './profile.controller';
import { completeProfileSchema, updateProfileSchema } from './profile.validator';
import { validate } from '../../middleware/validation.middleware';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', profileController.getProfile);
router.put('/complete', validate(completeProfileSchema), profileController.completeProfile);
router.put('/', validate(updateProfileSchema), profileController.updateProfile);

export default router;
