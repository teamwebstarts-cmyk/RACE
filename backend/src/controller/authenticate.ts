import { Router } from 'express';
import type { Request, Response } from 'express';

import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/apiResponse';
import { authService } from '../services/auth';
import {
  sendOtpSchema,
  verifyOtpSchema,
  refreshTokenSchema,
} from '../auth/validators';
import {
  authRateLimiter,
  otpRateLimiter,
  validate,
} from '../middleware';

const router = Router();

router.post(
  '/send-otp',
  otpRateLimiter,
  authRateLimiter,
  validate(sendOtpSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.sendOtp(req.body);
    return sendSuccess(res, result);
  }),
);

router.post(
  '/verify-otp',
  authRateLimiter,
  validate(verifyOtpSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.verifyOtp(req.body);
    return sendSuccess(res, result);
  }),
);

router.post(
  '/refresh-token',
  authRateLimiter,
  validate(refreshTokenSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.refreshToken(req.body);
    return sendSuccess(res, result);
  }),
);

export default router;
