import type { Request, Response } from 'express';

import { asyncHandler } from '../../../shared/utils/asyncHandler';
import { sendSuccess } from '../../../shared/utils/apiResponse';
import { adminFinanceService } from '../finance/admin-finance.service';

export const adminFinanceController = {
  listTransactions: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await adminFinanceService.listTransactions(req.query as never));
  }),

  getSummary: asyncHandler(async (_req: Request, res: Response) => {
    sendSuccess(res, await adminFinanceService.getSummary());
  }),
};
