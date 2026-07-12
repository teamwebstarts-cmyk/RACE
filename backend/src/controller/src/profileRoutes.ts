import { Router } from 'express';

import { profileController } from './profile';
import { completeProfileSchema, updateProfileSchema } from '../../services/src/profileValidator';
import { validate } from '../../middleware/src/validation';
import { authMiddleware } from '../../middleware/src/auth';

const router = Router();

router.use(authMiddleware);

router.get('/', profileController.getProfile);
router.put('/complete', validate(completeProfileSchema), profileController.completeProfile);
router.put('/', validate(updateProfileSchema), profileController.updateProfile);

export default router;
