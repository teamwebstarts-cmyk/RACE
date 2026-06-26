import type { Request, Response } from 'express';

import { asyncHandler } from '../../../shared/utils/asyncHandler';
import { sendSuccess } from '../../../shared/utils/apiResponse';
import { adminReportsService } from '../reports/admin-reports.service';

export const adminReportsController = {
  getReports: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await adminReportsService.getReports(
      req.query.dateFrom as string,
      req.query.dateTo as string,
    ));
  }),
};
