import { Router } from 'express';

import { authMiddleware } from '../../middleware/src/auth';
import { validate } from '../../middleware/src/validation';
import { paymentController } from './payment';
import { createPaymentMethodSchema } from '../../services/src/paymentValidator';

const router = Router();

router.use(authMiddleware);

router.get('/', paymentController.listMethods);
router.post('/', validate(createPaymentMethodSchema), paymentController.createMethod);
router.delete('/:id', paymentController.removeMethod);

export default router;
