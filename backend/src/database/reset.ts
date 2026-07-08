import dotenv from 'dotenv';
import Redis from 'ioredis';

import { env } from '../config/env';
import { connectDatabase, disconnectDatabase, getDatabaseConnection } from './connection';
import { logger } from '../shared/utils/logger';

dotenv.config();

async function flushRedis(): Promise<void> {
  const client = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: 1,
    lazyConnect: true,
    retryStrategy: () => null,
    enableOfflineQueue: false,
  });

  try {
    await client.connect();
    await client.flushdb();
    logger.info('Redis cache flushed');
  } catch (error) {
    logger.warn('Redis flush skipped (not running or unreachable)', {
      error: error instanceof Error ? error.message : String(error),
    });
  } finally {
    await client.quit().catch(() => undefined);
  }
}

async function runReset(): Promise<void> {
  await connectDatabase();

  const connection = getDatabaseConnection();
  await connection.dropDatabase();
  logger.info('MongoDB database dropped', { database: connection.name });

  await disconnectDatabase();
  await flushRedis();
}

runReset().catch(async (error: Error) => {
  logger.error('Database reset failed', { error: error.message });
  await disconnectDatabase().catch(() => undefined);
  process.exit(1);
});
