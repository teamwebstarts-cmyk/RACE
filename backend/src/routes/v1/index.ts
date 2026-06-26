import { Router } from 'express';

import { env } from '../../config/env';
import { authMiddleware } from '../../middleware/auth.middleware';
import { paymentController } from '../../modules/payments/payment.controller';
import authRoutes from '../../modules/auth/auth.routes';
import bookingRoutes from '../../modules/bookings/booking.routes';
import brandRoutes from '../../modules/brand/brand.routes';
import locationRoutes from '../../modules/locations/location.routes';
import notificationRoutes from '../../modules/notifications/notification.routes';
import paymentRoutes from '../../modules/payments/payment.routes';
import profileRoutes from '../../modules/users/profile.routes';
import serviceRoutes from '../../modules/services/service.routes';
import sosRoutes from '../../modules/sos/sos.routes';
import subscriptionRoutes from '../../modules/subscriptions/subscription.routes';
import vehicleRoutes from '../../modules/vehicles/vehicle.routes';
import qrRoutes from '../../modules/vehicles/qr.routes';
import vendorRoutes from '../../modules/vendors/vendor.routes';
import adminRoutes from '../../modules/admin/routes';

const router = Router();
const api = env.API_PREFIX;

/** Customer & mobile app API */
router.use(`${api}/auth`, authRoutes);
router.use(`${api}/brand`, brandRoutes);
router.use(`${api}/services`, serviceRoutes);
router.use(`${api}/profile`, profileRoutes);
router.get(`${api}/profile/wallet`, authMiddleware, paymentController.getWallet);
router.use(`${api}/profile/locations`, locationRoutes);
router.use(`${api}/profile/payment-methods`, paymentRoutes);
router.use(`${api}/profile/notifications`, notificationRoutes);
router.use(`${api}/vehicles`, vehicleRoutes);
router.use(`${api}/qr`, qrRoutes);
router.use(`${api}/bookings`, bookingRoutes);
router.use(`${api}/subscriptions`, subscriptionRoutes);
router.use(`${api}/sos`, sosRoutes);
router.use(`${api}/vendor`, vendorRoutes);

/** Admin panel API */
router.use(`${api}/admin`, adminRoutes);

export default router;
