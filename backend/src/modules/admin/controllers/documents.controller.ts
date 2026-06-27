import type { Request, Response } from 'express';

import { asyncHandler } from '../../../shared/utils/asyncHandler';
import { adminDocumentsService } from '../documents/admin-documents.service';
import { routeParam } from '../shared/route-param';
import { sendPdfResponse } from '../utils/request.utils';

export const adminDocumentsController = {
  getVendorDocument: asyncHandler(async (req: Request, res: Response) => {
    const file = adminDocumentsService.getVendorDocument(
      routeParam(req.params.vendorId),
      routeParam(req.params.docKey),
    );
    sendPdfResponse(res, file.filename, file.buffer);
  }),

  getDriverDocument: asyncHandler(async (req: Request, res: Response) => {
    const file = adminDocumentsService.getDriverDocument(
      routeParam(req.params.driverId),
      routeParam(req.params.docKey),
    );
    sendPdfResponse(res, file.filename, file.buffer);
  }),
};
