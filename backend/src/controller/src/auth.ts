import type { Request, Response } from 'express';

import { asyncHandler } from '../../utils/src/asyncHandler';
import { sendSuccess } from '../../utils/src/apiResponse';
import { authService } from '../../services/src/auth';

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
