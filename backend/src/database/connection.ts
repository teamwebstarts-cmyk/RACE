import mongoose from 'mongoose';

import { env } from '../configs/env';
import { logger } from '../shared/utils/logger';

export async function connectDatabase(): Promise<void> {
  mongoose.set('strictQuery', true);
  await mongoose.connect(env.MONGODB_URI);
  logger.info('MongoDB connected', { database: mongoose.connection.name });
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
  logger.info('MongoDB disconnected');
}

export function getDatabaseConnection() {
  return mongoose.connection;
}
