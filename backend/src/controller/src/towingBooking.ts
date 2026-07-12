import type { Request, Response } from 'express';

import { asyncHandler } from '../../utils/src/asyncHandler';
import { sendSuccess } from '../../utils/src/apiResponse';
import { getAuthUser, getParamId } from '../../utils/src/request';
import type { UnifiedBookingStatus } from '../../services/src/bookingStatusConstants';
import { towingBookingService } from '../../services/src/bookings/towingBooking';

export class TowingBookingController {
  create = asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const booking = await towingBookingService.createBooking(user.id, req.body);
    return sendSuccess(res, booking, 201);
  });

  list = asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const status = req.query.status as UnifiedBookingStatus | undefined;
    const bookings = await towingBookingService.listBookings(user.id, status);
    return sendSuccess(res, bookings);
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const booking = await towingBookingService.getBookingById(getParamId(req.params.id), user);
    return sendSuccess(res, booking);
  });

  updateStatus = asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const booking = await towingBookingService.updateStatus(
      getParamId(req.params.id),
      req.body.status,
      user,
    );
    return sendSuccess(res, booking);
  });

  getTracking = asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const tracking = await towingBookingService.getTracking(getParamId(req.params.id), user);
    return sendSuccess(res, tracking);
  });

  getCancelPreview = asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const policy = await towingBookingService.getCancellationPreview(getParamId(req.params.id), user.id);
    return sendSuccess(res, policy);
  });

  cancel = asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const result = await towingBookingService.cancelBooking(
      getParamId(req.params.id),
      user.id,
      req.body.reason,
    );
    return sendSuccess(res, {
      message: 'Booking cancelled',
      refundAmount: result.refundAmount,
      refundStatus: result.refundStatus,
      policy: result.policy,
      booking: result.booking,
    });
  });

  submitRating = asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const booking = await towingBookingService.submitRating(
      getParamId(req.params.id),
      user,
      req.body,
    );
    return sendSuccess(res, booking);
  });
}

export const towingBookingController = new TowingBookingController();
