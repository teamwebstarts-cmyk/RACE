import { Router } from 'express';

import { env } from '../configs/env';
import authRoutes from '../modules/auth/auth.routes';
import bookingRoutes from '../modules/bookings/booking.routes';
import brandRoutes from '../modules/brand/brand.routes';
import locationRoutes from '../modules/locations/location.routes';
import notificationRoutes from '../modules/notifications/notification.routes';
import paymentRoutes from '../modules/payments/payment.routes';
import profileRoutes from '../modules/users/profile.routes';
import serviceRoutes from '../modules/services/service.routes';
import sosRoutes from '../modules/sos/sos.routes';
import subscriptionRoutes from '../modules/subscriptions/subscription.routes';
import vehicleRoutes from '../modules/vehicles/vehicle.routes';
import qrRoutes from '../modules/vehicles/qr.routes';
import vendorRoutes from '../modules/vendors/vendor.routes';
import adminRoutes from '../modules/admin/admin.routes';
import { paymentController } from '../modules/payments/payment.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(`${env.API_PREFIX}/auth`, authRoutes);
router.use(`${env.API_PREFIX}/brand`, brandRoutes);
router.use(`${env.API_PREFIX}/services`, serviceRoutes);
router.use(`${env.API_PREFIX}/profile`, profileRoutes);
router.use(`${env.API_PREFIX}/profile/locations`, locationRoutes);
router.use(`${env.API_PREFIX}/profile/payment-methods`, paymentRoutes);
router.use(`${env.API_PREFIX}/profile/notifications`, notificationRoutes);
router.get(`${env.API_PREFIX}/profile/wallet`, authMiddleware, paymentController.getWallet);
router.use(`${env.API_PREFIX}/vehicles`, vehicleRoutes);
router.use(`${env.API_PREFIX}/qr`, qrRoutes);
router.use(`${env.API_PREFIX}/bookings`, bookingRoutes);
router.use(`${env.API_PREFIX}/subscriptions`, subscriptionRoutes);
router.use(`${env.API_PREFIX}/sos`, sosRoutes);
router.use(`${env.API_PREFIX}/vendor`, vendorRoutes);
router.use(`${env.API_PREFIX}/admin`, adminRoutes);

export default router;
