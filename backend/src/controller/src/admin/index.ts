import { Router } from 'express';

import adminAuthRoutes from './adminAuthRoutes';
import adminDashboardRoutes from './adminDashboardRoutes';
import documentsRoutes from './documentsRoutes';
import customersRoutes from './customersRoutes';
import vendorsRoutes from './vendorsRoutes';
import driversRoutes from './driversRoutes';
import bookingsRoutes from './bookingsRoutes';
import financeRoutes from './financeRoutes';
import reportsRoutes from './reportsRoutes';
import settingsRoutes from './settingsRoutes';
import notificationsRoutes from './notificationsRoutes';
import adminsRoutes from './adminsRoutes';
import subscriptionsRoutes from './subscriptionsRoutes';

const router = Router();

router.use('/auth', adminAuthRoutes);
router.use('/dashboard', adminDashboardRoutes);
router.use(documentsRoutes);
router.use(customersRoutes);
router.use(vendorsRoutes);
router.use(driversRoutes);
router.use(bookingsRoutes);
router.use(financeRoutes);
router.use(reportsRoutes);
router.use(settingsRoutes);
router.use(notificationsRoutes);
router.use(adminsRoutes);
router.use(subscriptionsRoutes);

export default router;
