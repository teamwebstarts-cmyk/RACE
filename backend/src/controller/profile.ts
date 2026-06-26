import { Router } from 'express';
import type { Request, Response } from 'express';

import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/apiResponse';
import { getAuthUser } from '../utils/request';
import { profileService } from '../services/profile';
import { authenticator, validate } from '../middleware';
import {
  completeProfileSchema,
  updateProfileSchema,
} from './helper/profile';

const router = Router();

router.use(authenticator);

router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const profile = await profileService.getProfile(user.id);
    return sendSuccess(res, profile);
  }),
);

router.put(
  '/complete',
  validate(completeProfileSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const profile = await profileService.completeProfile(user.id, req.body);
    return sendSuccess(res, profile);
  }),
);

router.put(
  '/',
  validate(updateProfileSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const profile = await profileService.updateProfile(user.id, req.body);
    return sendSuccess(res, profile);
  }),
);

export default router;
