import { Router } from 'express';

import { brandController } from './brand';

const router = Router();

router.get('/', brandController.get);

export default router;
