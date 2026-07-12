import morgan from 'morgan';

import { logger } from '../../utils/src/logger';

const stream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};

export const loggerMiddleware = morgan(
  ':method :url :status :res[content-length] - :response-time ms',
  { stream },
);
