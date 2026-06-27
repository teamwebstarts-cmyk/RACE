import { Router } from 'express';

import { authMiddleware } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validation.middleware';
import { paymentController } from './payment.controller';
import { createPaymentMethodSchema } from './payment.validator';

const router = Router();

router.use(authMiddleware);

router.get('/', paymentController.listMethods);
router.post('/', validate(createPaymentMethodSchema), paymentController.createMethod);
router.delete('/:id', paymentController.removeMethod);

export default router;
