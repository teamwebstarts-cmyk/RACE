import type { Request, Response } from 'express';

import { asyncHandler } from '../../shared/utils/asyncHandler';
import { sendSuccess } from '../../shared/utils/apiResponse';
import { getAuthUser, getParamId } from '../../shared/utils/request';
import { vendorService } from './vendor.service';

export class VendorController {
  register = asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const vendor = await vendorService.register(user.id, req.body);
    return sendSuccess(res, vendor, 201);
  });

  getStatus = asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const vendor = await vendorService.getStatus(user.id);
    return sendSuccess(res, vendor);
  });

  listPending = asyncHandler(async (_req: Request, res: Response) => {
    const vendors = await vendorService.listPending();
    return sendSuccess(res, vendors);
  });

  review = asyncHandler(async (req: Request, res: Response) => {
    const vendor = await vendorService.review(getParamId(req.params.id), req.body);
    return sendSuccess(res, vendor);
  });
}

export const vendorController = new VendorController();
