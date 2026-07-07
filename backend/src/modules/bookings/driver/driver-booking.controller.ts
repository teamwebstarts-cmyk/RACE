import type { Request, Response } from 'express';

import { asyncHandler } from '../../../shared/utils/asyncHandler';
import { sendSuccess } from '../../../shared/utils/apiResponse';
import { getAuthUser, getParamId } from '../../../shared/utils/request';
import type { UnifiedBookingStatus } from '../shared/booking-status.constants';
import { driverBookingService } from './driver-booking.service';

export class DriverBookingController {
  create = asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const booking = await driverBookingService.createBooking(user.id, req.body);
    return sendSuccess(res, booking, 201);
  });

  list = asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const status = req.query.status as UnifiedBookingStatus | undefined;
    const bookings = await driverBookingService.listBookings(user.id, status);
    return sendSuccess(res, bookings);
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const booking = await driverBookingService.getBookingById(getParamId(req.params.id), user);
    return sendSuccess(res, booking);
  });

  updateStatus = asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const booking = await driverBookingService.updateStatus(
      getParamId(req.params.id),
      req.body.status,
      user,
    );
    return sendSuccess(res, booking);
  });

  getTracking = asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const tracking = await driverBookingService.getTracking(getParamId(req.params.id), user);
    return sendSuccess(res, tracking);
  });

  getCancelPreview = asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const policy = await driverBookingService.getCancellationPreview(getParamId(req.params.id), user.id);
    return sendSuccess(res, policy);
  });

  cancel = asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const result = await driverBookingService.cancelBooking(
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
    const booking = await driverBookingService.submitRating(
      getParamId(req.params.id),
      user,
      req.body,
    );
    return sendSuccess(res, booking);
  });
}

export const driverBookingController = new DriverBookingController();
