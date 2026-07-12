import { Router } from 'express';

import { serviceController } from './service';

const router = Router();

router.get('/upcoming', serviceController.upcoming);
router.get('/', serviceController.list);

export default router;
