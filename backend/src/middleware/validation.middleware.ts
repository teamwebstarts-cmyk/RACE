import type { NextFunction, Request, Response } from 'express';
import type { ZodSchema } from 'zod';

import { AppError } from '../shared/utils/errors';

type RequestPart = 'body' | 'query' | 'params';

function assignParsedRequestPart(
  req: Request,
  part: RequestPart,
  data: unknown,
): void {
  if (part === 'body') {
    req.body = data;
    return;
  }

  // Express 5 exposes query/params as read-only getters — mutate in place instead of reassignment.
  const target = req[part] as Record<string, unknown>;
  for (const key of Object.keys(target)) {
    delete target[key];
  }
  Object.assign(target, data as Record<string, unknown>);
}

export function validate(schema: ZodSchema, part: RequestPart = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[part]);

    if (!result.success) {
      const message = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
      next(new AppError(message, 400));
      return;
    }

    assignParsedRequestPart(req, part, result.data);
    next();
  };
}
