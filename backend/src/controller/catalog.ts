import { Router } from 'express';
import type { Request, Response } from 'express';

import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/apiResponse';
import { catalogService } from '../services/catalog';

const router = Router();

router.get(
  '/',
  asyncHandler(async (_req: Request, res: Response) => {
    const categories = await catalogService.getGroupedServices();
    return sendSuccess(res, categories);
  }),
);

export default router;
