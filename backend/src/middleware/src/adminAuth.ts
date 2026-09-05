import type { NextFunction, Request, Response } from 'express';

import { verifyAdminAccessToken } from '../../services/src/admin/adminJwt';
import { UnauthorizedError } from '../../utils/src/errors';

export function adminAuthMiddleware(req: Request, _res: Response, next: NextFunction): void {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedError('Missing or invalid authorization header');
    }

    const token = header.slice(7);
    const payload = verifyAdminAccessToken(token);

    req.admin = {
      id: payload.sub,
      role: payload.role,
      email: payload.email,
      permissions: payload.permissions,
    };

    next();
  } catch {
    next(new UnauthorizedError('Invalid or expired admin access token'));
  }
}
