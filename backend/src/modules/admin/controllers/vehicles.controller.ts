import type { Request, Response } from 'express';

import { asyncHandler } from '../../../shared/utils/asyncHandler';
import { sendSuccess } from '../../../shared/utils/apiResponse';
import { adminVehiclesService } from '../vehicles/admin-vehicles.service';
import { routeParam } from '../shared/route-param';
import { getAdminActor } from '../utils/request.utils';

export const adminVehiclesController = {
  update: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await adminVehiclesService.update(routeParam(req.params.id), req.body, getAdminActor(req)));
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await adminVehiclesService.remove(routeParam(req.params.id), getAdminActor(req));
    sendSuccess(res, { message: 'Deleted' });
  }),
};
