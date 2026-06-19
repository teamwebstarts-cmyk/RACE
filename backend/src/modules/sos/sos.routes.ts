import { Router } from 'express';

import { authMiddleware } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validation.middleware';
import { sosController } from './sos.controller';
import { sosAlertSchema } from './sos.validator';

const router = Router();

router.get('/config', sosController.getConfig);

router.use(authMiddleware);

router.get('/context', sosController.getContext);
router.post('/alert', validate(sosAlertSchema), sosController.trigger);

export default router;
