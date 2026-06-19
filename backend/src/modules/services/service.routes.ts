import { Router } from 'express';

import { serviceController } from './service.controller';

const router = Router();

router.get('/upcoming', serviceController.upcoming);
router.get('/', serviceController.list);

export default router;
