import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/src/asyncHandler';
import { sendSuccess } from '../../../utils/src/apiResponse';
import { adminAuthService } from '../../../services/src/admin/adminAuth';

export const adminAuthController = {
  login: asyncHandler(async (req: Request, res: Response) => {
    const result = await adminAuthService.login(
      req.body.identifier,
      req.body.password,
      req.ip,
    );
    sendSuccess(res, result);
  }),

  refreshToken: asyncHandler(async (req: Request, res: Response) => {
    const tokens = await adminAuthService.refreshToken(req.body.refreshToken);
    sendSuccess(res, { tokens });
  }),

  logout: asyncHandler(async (req: Request, res: Response) => {
    await adminAuthService.logout(req.body.refreshToken);
    sendSuccess(res, { message: 'Logged out' });
  }),

  me: asyncHandler(async (req: Request, res: Response) => {
    const user = await adminAuthService.getCurrentUser(req.admin!.id);
    sendSuccess(res, user);
  }),

  forgotPassword: asyncHandler(async (req: Request, res: Response) => {
    const result = await adminAuthService.forgotPassword(req.body.email);
    sendSuccess(res, result);
  }),

  resetPassword: asyncHandler(async (req: Request, res: Response) => {
    const result = await adminAuthService.resetPassword(req.body.token, req.body.password);
    sendSuccess(res, result);
  }),
};
