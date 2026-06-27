import type { Request, Response } from 'express';

import { asyncHandler } from '../../shared/utils/asyncHandler';
import { sendSuccess } from '../../shared/utils/apiResponse';
import { authService } from './auth.service';

export class AuthController {
  sendOtp = asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.sendOtp(req.body);
    return sendSuccess(res, result);
  });

  verifyOtp = asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.verifyOtp(req.body);
    return sendSuccess(res, result);
  });

  refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.refreshToken(req.body);
    return sendSuccess(res, result);
  });
}

export const authController = new AuthController();
