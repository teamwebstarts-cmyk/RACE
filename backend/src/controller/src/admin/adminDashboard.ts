import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/src/asyncHandler';
import { sendSuccess } from '../../../utils/src/apiResponse';
import { adminDashboardService } from '../../../services/src/admin/adminDashboard';

export const adminDashboardController = {
  getDashboard: asyncHandler(async (_req: Request, res: Response) => {
    const data = await adminDashboardService.getDashboard();
    sendSuccess(res, data);
  }),
};
