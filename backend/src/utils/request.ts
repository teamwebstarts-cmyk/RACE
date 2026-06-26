import type { Request } from 'express';

import { UnauthorizedError } from './errors';

export function getAuthUser(req: Request): { id: string; role: string; mobileNumber: string } {
  if (!req.user) {
    throw new UnauthorizedError();
  }
  return req.user;
}

export function getParamId(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}
