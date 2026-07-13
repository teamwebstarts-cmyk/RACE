import { Router } from 'express';

import { authMiddleware } from '../../middleware/src/auth';
import { validate } from '../../middleware/src/validation';
import { subscriptionController } from './subscription';
import { subscribeSchema, cancelSubscriptionSchema } from '../../services/src/subscriptionValidator';

const router = Router();

router.get('/plans', subscriptionController.listPlans);

router.use(authMiddleware);

router.get('/', subscriptionController.getCurrent);
router.post('/', validate(subscribeSchema), subscriptionController.subscribe);
router.post('/cancel', validate(cancelSubscriptionSchema), subscriptionController.cancel);

export default router;
