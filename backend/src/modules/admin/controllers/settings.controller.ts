import type { Request, Response } from 'express';

import { asyncHandler } from '../../../shared/utils/asyncHandler';
import { sendSuccess } from '../../../shared/utils/apiResponse';
import { adminSettingsService } from '../settings/admin-settings.service';
import { getAdminActor } from '../utils/request.utils';

export const adminSettingsController = {
  get: asyncHandler(async (_req: Request, res: Response) => {
    sendSuccess(res, await adminSettingsService.get());
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await adminSettingsService.update(req.body, getAdminActor(req)));
  }),
};
