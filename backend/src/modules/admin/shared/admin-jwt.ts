import jwt, { type SignOptions } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

import { env } from '../../../configs/env';
import { getCache } from '../../../configs/cache';

export interface AdminAccessTokenPayload {
  sub: string;
  role: string;
  email: string;
  permissions: string[];
  tokenType: 'admin';
}

export interface AdminRefreshTokenPayload {
  sub: string;
  jti: string;
  tokenType: 'admin';
}

const ADMIN_REFRESH_PREFIX = 'admin-refresh:';

export function signAdminAccessToken(payload: Omit<AdminAccessTokenPayload, 'tokenType'>): string {
  const options: SignOptions = { expiresIn: env.JWT_ACCESS_EXPIRES_IN as SignOptions['expiresIn'] };
  return jwt.sign({ ...payload, tokenType: 'admin' } satisfies AdminAccessTokenPayload, env.JWT_ACCESS_SECRET, options);
}

export function signAdminRefreshToken(adminId: string): { token: string; jti: string } {
  const jti = uuidv4();
  const options: SignOptions = { expiresIn: env.JWT_REFRESH_EXPIRES_IN as SignOptions['expiresIn'] };
  const token = jwt.sign(
    { sub: adminId, jti, tokenType: 'admin' } satisfies AdminRefreshTokenPayload,
    env.JWT_REFRESH_SECRET,
    options,
  );
  return { token, jti };
}

export async function storeAdminRefreshToken(adminId: string, jti: string): Promise<void> {
  const cache = getCache();
  const ttlSeconds = parseRefreshTtlSeconds(env.JWT_REFRESH_EXPIRES_IN);
  await cache.set(`${ADMIN_REFRESH_PREFIX}${adminId}:${jti}`, '1', 'EX', ttlSeconds);
}

export async function revokeAdminRefreshToken(adminId: string, jti: string): Promise<void> {
  const cache = getCache();
  await cache.del(`${ADMIN_REFRESH_PREFIX}${adminId}:${jti}`);
}

export async function isAdminRefreshTokenValid(adminId: string, jti: string): Promise<boolean> {
  const cache = getCache();
  const value = await cache.get(`${ADMIN_REFRESH_PREFIX}${adminId}:${jti}`);
  return value === '1';
}

export function verifyAdminAccessToken(token: string): AdminAccessTokenPayload {
  const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as AdminAccessTokenPayload;
  if (payload.tokenType !== 'admin') {
    throw new Error('Invalid admin token');
  }
  return payload;
}

export function verifyAdminRefreshToken(token: string): AdminRefreshTokenPayload {
  const payload = jwt.verify(token, env.JWT_REFRESH_SECRET) as AdminRefreshTokenPayload;
  if (payload.tokenType !== 'admin') {
    throw new Error('Invalid admin refresh token');
  }
  return payload;
}

export async function generateAdminTokenPair(
  adminId: string,
  role: string,
  email: string,
  permissions: string[],
): Promise<{ accessToken: string; refreshToken: string; expiresIn: string }> {
  const accessToken = signAdminAccessToken({ sub: adminId, role, email, permissions });
  const { token: refreshToken, jti } = signAdminRefreshToken(adminId);
  await storeAdminRefreshToken(adminId, jti);

  return {
    accessToken,
    refreshToken,
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  };
}

function parseRefreshTtlSeconds(duration: string): number {
  const match = duration.match(/^(\d+)([smhd])$/);
  if (!match) return 7 * 24 * 60 * 60;
  const value = Number(match[1]);
  const unit = match[2];
  switch (unit) {
    case 's':
      return value;
    case 'm':
      return value * 60;
    case 'h':
      return value * 60 * 60;
    case 'd':
      return value * 24 * 60 * 60;
    default:
      return 7 * 24 * 60 * 60;
  }
}
