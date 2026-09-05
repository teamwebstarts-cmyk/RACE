import type { NextFunction, Request, Response } from 'express';

import { ForbiddenError } from '../../utils/src/errors';
import { getAuthUser } from '../../utils/src/request';
import { userRepository } from '../../services/src/userRepository';

export function requireRole(...roles: string[]) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = getAuthUser(req);
      if (roles.includes(user.role)) {
        next();
        return;
      }

      // JWT role can lag after vendor registration or admin approval — trust DB role.
      const dbUser = await userRepository.findById(user.id);
      if (dbUser && roles.includes(dbUser.role)) {
        req.user = {
          id: user.id,
          role: dbUser.role,
          mobileNumber: dbUser.mobileNumber,
        };
        next();
        return;
      }

      next(new ForbiddenError('Insufficient permissions'));
    } catch (error) {
      next(error);
    }
  };
}
