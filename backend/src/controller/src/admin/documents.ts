import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/src/asyncHandler';
import { adminDocumentsService } from '../../../services/src/admin/adminDocuments';
import { routeParam } from '../../../services/src/admin/routeParam';
import { sendPdfResponse } from '../../../utils/src/adminRequest.utils';

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
