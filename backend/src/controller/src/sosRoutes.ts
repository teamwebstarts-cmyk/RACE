import { Router } from 'express';

import { authMiddleware } from '../../middleware/src/auth';
import { validate } from '../../middleware/src/validation';
import { sosController } from './sos';
import { sosAlertSchema } from '../../services/src/sosValidator';

const router = Router();

router.get('/config', sosController.getConfig);

router.use(authMiddleware);

router.get('/context', sosController.getContext);
router.post('/alert', validate(sosAlertSchema), sosController.trigger);

export default router;
