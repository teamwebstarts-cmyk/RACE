import type { Request, Response } from 'express';

import { asyncHandler } from '../../utils/src/asyncHandler';
import { sendSuccess } from '../../utils/src/apiResponse';
import { brandService } from '../../services/src/brand';

export class BrandController {
  get = asyncHandler(async (_req: Request, res: Response) => {
    const brand = await brandService.getBrand();
    return sendSuccess(res, brand);
  });
}

export const brandController = new BrandController();
