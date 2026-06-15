import { Router } from 'express';

import { authController } from './auth.controller';
import { sendOtpSchema, verifyOtpSchema } from './auth.validator';
import { refreshTokenSchema } from './auth.dto';
import { validate } from '../../middleware/validation.middleware';
import { authRateLimiter, otpRateLimiter } from '../../middleware/rateLimiter.middleware';

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
  '/refresh-token',
  authRateLimiter,
  validate(refreshTokenSchema),
  authController.refreshToken,
);

export default router;
