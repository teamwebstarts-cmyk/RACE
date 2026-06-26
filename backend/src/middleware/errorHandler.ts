import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';
import { sendError } from '../utils/apiResponse';

export function errorHandler(
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): Response {
  if (error instanceof AppError) {
    return sendError(res, error.message, error.statusCode);
  }

  if (error instanceof ZodError) {
    const message = error.errors.map((e) => e.message).join(', ');
    return sendError(res, message, 400);
  }

  logger.error('Unhandled error', { error: error.message, stack: error.stack });
  return sendError(res, 'Internal server error', 500);
}

export function notFoundHandler(_req: Request, res: Response): Response {
  return sendError(res, 'Route not found', 404);
}
