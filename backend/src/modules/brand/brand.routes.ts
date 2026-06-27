import { Router } from 'express';

import { brandController } from './brand.controller';

const router = Router();

router.get('/', brandController.get);

export default router;
