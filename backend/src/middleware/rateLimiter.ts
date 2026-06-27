import rateLimit from 'express-rate-limit';

import { env } from '../config/env';

export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: env.NODE_ENV === 'production' ? 200 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later' },
});

const isDev = env.NODE_ENV !== 'production';

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 10_000 : 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many authentication attempts' },
});

export const otpRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: isDev ? 10_000 : 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'OTP rate limit exceeded' },
});
