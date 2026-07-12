import type { Request, Response } from 'express';

import { asyncHandler } from '../../utils/src/asyncHandler';
import { sendSuccess } from '../../utils/src/apiResponse';
import { getAuthUser, getParamId } from '../../utils/src/request';
import { locationService } from '../../services/src/location';

export class LocationController {
  list = asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const locations = await locationService.list(user.id);
    return sendSuccess(res, locations);
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const location = await locationService.create(user.id, req.body);
    return sendSuccess(res, location, 201);
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const location = await locationService.update(user.id, getParamId(req.params.id), req.body);
    return sendSuccess(res, location);
  });

  remove = asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    await locationService.remove(user.id, getParamId(req.params.id));
    return sendSuccess(res, { message: 'Location deleted' });
  });
}

export const locationController = new LocationController();
