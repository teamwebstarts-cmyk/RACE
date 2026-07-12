import type { Request, Response } from 'express';

import { asyncHandler } from '../../utils/src/asyncHandler';
import { sendSuccess } from '../../utils/src/apiResponse';
import { fareService } from '../../services/src/fare';

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
