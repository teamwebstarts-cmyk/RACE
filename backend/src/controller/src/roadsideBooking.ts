import type { Request, Response } from 'express';

import { asyncHandler } from '../../utils/src/asyncHandler';
import { sendSuccess } from '../../utils/src/apiResponse';
import { getAuthUser } from '../../utils/src/request';
import { roadsideBookingService } from '../../services/src/bookings/roadsideBooking';

export class RoadsideBookingController {
  create = asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const result = await roadsideBookingService.createBooking(user.id, req.body);
    return sendSuccess(res, result, result.available ? 201 : 200);
  });

  getAvailability = asyncHandler(async (_req: Request, res: Response) => {
    const availability = await roadsideBookingService.getAvailability();
    return sendSuccess(res, availability);
  });
}

export const roadsideBookingController = new RoadsideBookingController();
