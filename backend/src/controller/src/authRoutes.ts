import { Router } from 'express';

import { authController } from './auth';
import {
  driverCredentialLoginSchema,
  sendOtpSchema,
  verifyOtpSchema,
} from '../../services/src/authValidator';
import { refreshTokenSchema } from '../../services/src/authDto';
import { validate } from '../../middleware/src/validation';
import { authRateLimiter, otpRateLimiter } from '../../middleware/src/rateLimiter';

const router = Router();

router.post(
  '/send-otp',
  otpRateLimiter,
  authRateLimiter,
  validate(sendOtpSchema),
  authController.sendOtp,
);

router.post(
  '/verify-otp',
  authRateLimiter,
  validate(verifyOtpSchema),
  authController.verifyOtp,
);

router.post(
  '/driver-login',
  authRateLimiter,
  validate(driverCredentialLoginSchema),
  authController.driverLogin,
);

router.post(
  '/refresh-token',
  authRateLimiter,
  validate(refreshTokenSchema),
  authController.refreshToken,
);

export default router;
