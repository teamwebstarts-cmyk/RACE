import type { Request, Response } from 'express';

import { asyncHandler } from '../../shared/utils/asyncHandler';
import { sendSuccess } from '../../shared/utils/apiResponse';
import { serviceCatalogService } from './service.service';

export class ServiceController {
  list = asyncHandler(async (_req: Request, res: Response) => {
    const categories = await serviceCatalogService.getGroupedServices();
    return sendSuccess(res, categories);
  });

  upcoming = asyncHandler(async (_req: Request, res: Response) => {
    const services = await serviceCatalogService.getUpcomingServices();
    return sendSuccess(res, services);
  });
}

export const serviceController = new ServiceController();
