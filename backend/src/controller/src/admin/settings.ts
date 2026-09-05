import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/src/asyncHandler';
import { sendSuccess } from '../../../utils/src/apiResponse';
import { adminSettingsService } from '../../../services/src/admin/adminSettings';
import { getAdminActor } from '../../../utils/src/adminRequest.utils';

export const adminSettingsController = {
  get: asyncHandler(async (_req: Request, res: Response) => {
    sendSuccess(res, await adminSettingsService.get());
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await adminSettingsService.update(req.body, getAdminActor(req)));
  }),
};
