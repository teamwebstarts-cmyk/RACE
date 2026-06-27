import { env } from './env';
import { logger } from '../shared/utils/logger';

export interface CacheClient {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, mode?: 'EX', ttl?: number): Promise<void>;
  incr(key: string): Promise<number>;
  del(...keys: string[]): Promise<void>;
  connect(): Promise<void>;
  quit(): Promise<void>;
}

class MemoryCache implements CacheClient {
  private store = new Map<string, { value: string; expiresAt?: number }>();

  async connect(): Promise<void> {
    logger.warn('Using in-memory cache (development fallback)');
  }

  async quit(): Promise<void> {
    this.store.clear();
  }

  private purgeExpired(key: string): void {
    const entry = this.store.get(key);
    if (entry?.expiresAt && entry.expiresAt <= Date.now()) {
      this.store.delete(key);
    }
  }

  async get(key: string): Promise<string | null> {
    this.purgeExpired(key);
    return this.store.get(key)?.value ?? null;
  }

  async set(key: string, value: string, mode?: 'EX', ttl?: number): Promise<void> {
    const expiresAt = mode === 'EX' && ttl ? Date.now() + ttl * 1000 : undefined;
    this.store.set(key, { value, expiresAt });
  }

  async incr(key: string): Promise<number> {
    this.purgeExpired(key);
    const current = Number(this.store.get(key)?.value ?? 0) + 1;
    const expiresAt = this.store.get(key)?.expiresAt;
    this.store.set(key, { value: String(current), expiresAt });
    return current;
  }

  async del(...keys: string[]): Promise<void> {
    keys.forEach((key) => this.store.delete(key));
  }
}

class RedisCache implements CacheClient {
  private client: import('ioredis').default;

  constructor(url: string) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Redis = require('ioredis') as typeof import('ioredis').default;
    this.client = new Redis(url, {
      maxRetriesPerRequest: 1,
      lazyConnect: true,
      retryStrategy: () => null,
      enableOfflineQueue: false,
    });
  }

  async connect(): Promise<void> {
    await this.client.connect();
    logger.info('Redis connected');
  }

  async quit(): Promise<void> {
    await this.client.quit();
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string, mode?: 'EX', ttl?: number): Promise<void> {
    if (mode === 'EX' && ttl) {
      await this.client.set(key, value, 'EX', ttl);
      return;
    }
    await this.client.set(key, value);
  }

  async incr(key: string): Promise<number> {
    return this.client.incr(key);
  }

  async del(...keys: string[]): Promise<void> {
    if (keys.length > 0) {
      await this.client.del(...keys);
    }
  }
}

let cache: CacheClient | null = null;

export function getCache(): CacheClient {
  if (!cache) {
    throw new Error('Cache not initialized');
  }
  return cache;
}

export async function connectCache(): Promise<void> {
  if (env.NODE_ENV === 'development') {
    const redisCache = new RedisCache(env.REDIS_URL);
    try {
      await redisCache.connect();
      cache = redisCache;
      return;
    } catch {
      await redisCache.quit().catch(() => undefined);
      logger.warn('Redis unavailable — falling back to in-memory cache for development');
      const memoryCache = new MemoryCache();
      await memoryCache.connect();
      cache = memoryCache;
      return;
    }
  }

  const redisCache = new RedisCache(env.REDIS_URL);
  await redisCache.connect();
  cache = redisCache;
}

export async function disconnectCache(): Promise<void> {
  if (cache) {
    await cache.quit();
    cache = null;
  }
}
