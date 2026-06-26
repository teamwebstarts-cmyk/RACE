import { createApp } from './app';
import { connectDatabase, disconnectDatabase } from './config/database';
import { connectCache, disconnectCache } from './config/cache';
import { env } from './config/env';
import { logger } from './shared/utils/logger';

async function bootstrap(): Promise<void> {
  await connectDatabase();
  const { ensureDatabaseIndexes } = await import('./database/indexes');
  await ensureDatabaseIndexes();
  await connectCache();

  const app = createApp();

  const server = app.listen(env.PORT, () => {
    logger.info(`RACE API running on port ${env.PORT}`, {
      env: env.NODE_ENV,
      apiPrefix: env.API_PREFIX,
    });
  });

  const shutdown = async (signal: string) => {
    logger.info(`${signal} received, shutting down gracefully`);
    server.close(async () => {
      await disconnectCache();
      await disconnectDatabase();
      process.exit(0);
    });
  };

  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
}

bootstrap().catch((error: Error) => {
  logger.error('Failed to start server', { error: error.message });
  process.exit(1);
});
