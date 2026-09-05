import type { Request, Response } from 'express';

import { asyncHandler } from '../../utils/src/asyncHandler';
import { sendSuccess } from '../../utils/src/apiResponse';
import { getAuthUser } from '../../utils/src/request';
import { sosService } from '../../services/src/sos';

export class SosController {
  getConfig = asyncHandler(async (_req: Request, res: Response) => {
    const config = sosService.getAppConfig();
    return sendSuccess(res, config);
  });

  trigger = asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const result = await sosService.triggerAlert(user.id, req.body);
    return sendSuccess(res, result, 201);
  });

  getContext = asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const vehicleId = req.query.vehicleId as string | undefined;
    const context = await sosService.getEmergencyContext(user.id, vehicleId);
    return sendSuccess(res, context);
  });
}

export const sosController = new SosController();
