import type { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
        mobileNumber: string;
      };
    }
  }
}

export type AuthenticatedRequest = Request & {
  user: {
    id: string;
    role: string;
    mobileNumber: string;
  };
};
