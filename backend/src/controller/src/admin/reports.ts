import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/src/asyncHandler';
import { sendSuccess } from '../../../utils/src/apiResponse';
import { adminReportsService } from '../../../services/src/admin/adminReports';

export const adminReportsController = {
  getReports: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await adminReportsService.getReports(
      req.query.dateFrom as string,
      req.query.dateTo as string,
    ));
  }),
};
