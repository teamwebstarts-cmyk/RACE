import type { Request, Response } from 'express';

import { asyncHandler } from '../../shared/utils/asyncHandler';
import { sendSuccess } from '../../shared/utils/apiResponse';
import { getAuthUser } from '../../shared/utils/request';
import { combinedBookingService } from './combined-booking.service';
import type { CombinedBookingListQuery } from './combined-booking.validator';

export class BookingController {
  list = asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const query = req.query as CombinedBookingListQuery;
    const bookings = await combinedBookingService.listBookings(user.id, query);
    return sendSuccess(res, bookings);
  });
}

export const bookingController = new BookingController();
