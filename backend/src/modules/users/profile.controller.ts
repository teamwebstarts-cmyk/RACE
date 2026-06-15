import type { Request, Response } from 'express';

import { asyncHandler } from '../../shared/utils/asyncHandler';
import { sendSuccess } from '../../shared/utils/apiResponse';
import { getAuthUser } from '../../shared/utils/request';
import { profileService } from './profile.service';

export class ProfileController {
  getProfile = asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const profile = await profileService.getProfile(user.id);
    return sendSuccess(res, profile);
  });

  updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const profile = await profileService.updateProfile(user.id, req.body);
    return sendSuccess(res, profile);
  });

  completeProfile = asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const profile = await profileService.completeProfile(user.id, req.body);
    return sendSuccess(res, profile);
  });
}

export const profileController = new ProfileController();
