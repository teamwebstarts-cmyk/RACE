import type { Request, Response } from 'express';

import { asyncHandler } from '../../../shared/utils/asyncHandler';
import { sendSuccess } from '../../../shared/utils/apiResponse';
import { adminDashboardService } from './admin-dashboard.service';

export const adminDashboardController = {
  getDashboard: asyncHandler(async (_req: Request, res: Response) => {
    const data = await adminDashboardService.getDashboard();
    sendSuccess(res, data);
  }),
};
