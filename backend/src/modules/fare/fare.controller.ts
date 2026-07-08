import type { Request, Response } from 'express';

import { asyncHandler } from '../../shared/utils/asyncHandler';
import { sendSuccess } from '../../shared/utils/apiResponse';
import { fareService } from './fare.service';

export class FareController {
  estimateTowing = asyncHandler(async (req: Request, res: Response) => {
    const result = await fareService.estimateTowingFare(req.query as never);
    return sendSuccess(res, result);
  });

  estimateDriver = asyncHandler(async (req: Request, res: Response) => {
    const result = fareService.estimateDriverFare(req.query as never);
    return sendSuccess(res, result);
  });
}

export const fareController = new FareController();
