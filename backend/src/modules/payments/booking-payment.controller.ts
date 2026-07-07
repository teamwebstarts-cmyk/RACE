import type { Request, Response } from 'express';

import { asyncHandler } from '../../shared/utils/asyncHandler';
import { sendSuccess } from '../../shared/utils/apiResponse';
import { getAuthUser } from '../../shared/utils/request';
import { bookingPaymentService } from './booking-payment.service';

export class BookingPaymentController {
  initiateAdvance = asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const session = await bookingPaymentService.initiateAdvance(user.id, req.body);
    return sendSuccess(res, session, 201);
  });

  verifyAdvance = asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const session = await bookingPaymentService.verifyAdvance(user.id, req.body);
    return sendSuccess(res, session);
  });

  initiateFinal = asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const session = await bookingPaymentService.initiateFinal(user.id, req.body);
    return sendSuccess(res, session, 201);
  });

  verifyFinal = asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const session = await bookingPaymentService.verifyFinal(user.id, req.body);
    return sendSuccess(res, session);
  });
}

export const bookingPaymentController = new BookingPaymentController();
