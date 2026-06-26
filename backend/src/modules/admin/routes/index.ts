import { Router } from 'express';

import adminAuthRoutes from '../auth/admin-auth.routes';
import adminDashboardRoutes from '../dashboard/admin-dashboard.routes';
import documentsRoutes from './documents.routes';
import customersRoutes from './customers.routes';
import vendorsRoutes from './vendors.routes';
import driversRoutes from './drivers.routes';
import bookingsRoutes from './bookings.routes';
import financeRoutes from './finance.routes';
import reportsRoutes from './reports.routes';
import settingsRoutes from './settings.routes';
import notificationsRoutes from './notifications.routes';
import adminsRoutes from './admins.routes';
import subscriptionsRoutes from './subscriptions.routes';

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
