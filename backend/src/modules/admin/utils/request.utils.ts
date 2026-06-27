import type { Request, Response } from 'express';

export function getAdminActor(req: Request) {
  return { id: req.admin!.id, name: req.admin!.email };
}

export function sendPdfResponse(res: Response, filename: string, buffer: Buffer) {
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
  res.send(buffer);
}
