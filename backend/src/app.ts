import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import { env } from './config/env';
import apiRoutes from './controller';
import healthRoutes from './controller/health';
import {
  errorHandler,
  globalRateLimiter,
  loggerMiddleware,
  notFoundHandler,
} from './middleware';

export function createApp() {
  const app = express();

  app.set('trust proxy', 1);

  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(','),
      credentials: true,
    }),
  );
  app.use(compression());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(loggerMiddleware);
  app.use(globalRateLimiter);

  app.use('/health', healthRoutes);
  app.use(apiRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
