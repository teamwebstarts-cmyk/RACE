import type { Request, Response } from 'express';

import { asyncHandler } from '../../shared/utils/asyncHandler';
import { sendSuccess } from '../../shared/utils/apiResponse';
import { getAuthUser, getParamId } from '../../shared/utils/request';
import { bookingService } from './booking.service';
import type { BookingStatus } from './booking.model';

export class BookingController {
  create = asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const booking = await bookingService.createBooking(user.id, req.body);
    return sendSuccess(res, booking, 201);
  });

  list = asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const status = req.query.status as BookingStatus | undefined;
    const bookings = await bookingService.listBookings(user.id, status);
    return sendSuccess(res, bookings);
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const booking = await bookingService.getBooking(user.id, getParamId(req.params.id));
    return sendSuccess(res, booking);
  });

  getTracking = asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const tracking = await bookingService.getTracking(user.id, getParamId(req.params.id));
    return sendSuccess(res, tracking);
  });

  submitRating = asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const booking = await bookingService.submitRating(
      user.id,
      getParamId(req.params.id),
      req.body,
    );
    return sendSuccess(res, booking);
  });

  advanceDemo = asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const booking = await bookingService.advanceBookingForDemo(
      user.id,
      getParamId(req.params.id),
    );
    return sendSuccess(res, booking);
  });
}

export const bookingController = new BookingController();
