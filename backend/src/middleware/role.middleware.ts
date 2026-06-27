import type { NextFunction, Request, Response } from 'express';

import { ForbiddenError } from '../shared/utils/errors';
import { getAuthUser } from '../shared/utils/request';

export function requireRole(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const user = getAuthUser(req);
    if (!roles.includes(user.role)) {
      next(new ForbiddenError('Insufficient permissions'));
      return;
    }
    next();
  };
}
