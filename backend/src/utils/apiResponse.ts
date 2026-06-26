import type { Response } from 'express';

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
}

export function sendSuccess<T>(res: Response, data: T, statusCode = 200): Response {
  return res.status(statusCode).json({ success: true, data } satisfies ApiSuccessResponse<T>);
}

export function sendError(res: Response, message: string, statusCode = 400): Response {
  return res.status(statusCode).json({ success: false, message } satisfies ApiErrorResponse);
}
