import type { NextFunction, Request, Response } from 'express';

import { verifyAccessToken } from '../shared/utils/jwt';
import { UnauthorizedError } from '../shared/utils/errors';

export function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
  try {
    const header = req.headers.authorization;

    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedError('Missing or invalid authorization header');
    }

    const token = header.slice(7);
    const payload = verifyAccessToken(token);

    req.user = {
      id: payload.sub,
      role: payload.role,
      mobileNumber: payload.mobileNumber,
    };

    next();
  } catch {
    next(new UnauthorizedError('Invalid or expired access token'));
  }
}
