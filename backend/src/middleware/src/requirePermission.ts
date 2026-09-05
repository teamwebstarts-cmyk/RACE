import type { NextFunction, Request, Response } from 'express';

import { hasPermission, type AdminPermission } from '../../services/src/admin/rbac';
import { ForbiddenError, UnauthorizedError } from '../../utils/src/errors';

export function requireAdminPermission(...permissions: AdminPermission[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.admin) {
      next(new UnauthorizedError('Admin authentication required'));
      return;
    }

    if (!hasPermission(req.admin.permissions, permissions)) {
      next(new ForbiddenError('Insufficient permissions'));
      return;
    }

    next();
  };
}
