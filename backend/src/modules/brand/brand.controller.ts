import type { Request, Response } from 'express';

import { asyncHandler } from '../../shared/utils/asyncHandler';
import { sendSuccess } from '../../shared/utils/apiResponse';
import { brandService } from './brand.service';

export class BrandController {
  get = asyncHandler(async (_req: Request, res: Response) => {
    const brand = await brandService.getBrand();
    return sendSuccess(res, brand);
  });
}

export const brandController = new BrandController();
