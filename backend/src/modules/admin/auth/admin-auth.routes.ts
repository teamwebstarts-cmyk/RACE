import { Router } from 'express';

import { validate } from '../../../middleware/validation.middleware';
import { adminAuthMiddleware } from '../middleware/admin-auth.middleware';
import { adminAuthController } from './admin-auth.controller';
import {
  adminForgotPasswordSchema,
  adminLoginSchema,
  adminRefreshTokenSchema,
  adminResetPasswordSchema,
} from './admin-auth.validator';

const router = Router();

router.post('/login', validate(adminLoginSchema), adminAuthController.login);
router.post('/refresh-token', validate(adminRefreshTokenSchema), adminAuthController.refreshToken);
router.post('/logout', adminAuthController.logout);
router.post('/forgot-password', validate(adminForgotPasswordSchema), adminAuthController.forgotPassword);
router.post('/reset-password', validate(adminResetPasswordSchema), adminAuthController.resetPassword);
router.get('/me', adminAuthMiddleware, adminAuthController.me);

export default router;
