import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/src/asyncHandler';
import { sendSuccess } from '../../../utils/src/apiResponse';
import { adminFinanceService } from '../../../services/src/admin/adminFinance';

export const adminFinanceController = {
  listTransactions: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await adminFinanceService.listTransactions(req.query as never));
  }),

  getSummary: asyncHandler(async (_req: Request, res: Response) => {
    sendSuccess(res, await adminFinanceService.getSummary());
  }),
};
