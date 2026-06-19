import { Router } from 'express';

import { authMiddleware } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validation.middleware';
import { subscriptionController } from './subscription.controller';
import { subscribeSchema } from './subscription.validator';

const router = Router();

router.get('/plans', subscriptionController.listPlans);

router.use(authMiddleware);

router.get('/', subscriptionController.getCurrent);
router.post('/', validate(subscribeSchema), subscriptionController.subscribe);
router.post('/cancel', subscriptionController.cancel);

export default router;
