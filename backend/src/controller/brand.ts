import { Router } from 'express';
import type { Request, Response } from 'express';

import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/apiResponse';
import { brandService } from '../services/brand';

const router = Router();

router.get(
  '/',
  asyncHandler(async (_req: Request, res: Response) => {
    const brand = await brandService.getBrand();
    return sendSuccess(res, brand);
  }),
);

export default router;
