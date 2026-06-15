import { Router } from 'express';

import { env } from '../configs/env';
import authRoutes from '../modules/auth/auth.routes';
import brandRoutes from '../modules/brand/brand.routes';
import profileRoutes from '../modules/users/profile.routes';
import serviceRoutes from '../modules/services/service.routes';
import vehicleRoutes from '../modules/vehicles/vehicle.routes';

const router = Router();

router.use(`${env.API_PREFIX}/auth`, authRoutes);
router.use(`${env.API_PREFIX}/brand`, brandRoutes);
router.use(`${env.API_PREFIX}/services`, serviceRoutes);
router.use(`${env.API_PREFIX}/profile`, profileRoutes);
router.use(`${env.API_PREFIX}/vehicles`, vehicleRoutes);

export default router;
