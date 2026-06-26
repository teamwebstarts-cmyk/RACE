import { Router } from 'express';

import { env } from '../config/env';
import authenticateRoutes from './authenticate';
import brandRoutes from './brand';
import catalogRoutes from './catalog';
import profileRoutes from './profile';
import vehicleRoutes from './vehicles';

const router = Router();

router.use(`${env.API_PREFIX}/auth`, authenticateRoutes);
router.use(`${env.API_PREFIX}/brand`, brandRoutes);
router.use(`${env.API_PREFIX}/services`, catalogRoutes);
router.use(`${env.API_PREFIX}/profile`, profileRoutes);
router.use(`${env.API_PREFIX}/vehicles`, vehicleRoutes);

export default router;
