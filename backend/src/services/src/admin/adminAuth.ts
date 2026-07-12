import {
  getPlatformAdmin,
  PLATFORM_ADMIN_ID,
  verifyPlatformAdminCredentials,
} from '../../../config/hardcoded-admin';
import { env } from '../../../config/env';
import { logActivity } from './activityLogger';
import {
  generateAdminTokenPair,
  isAdminRefreshTokenValid,
  revokeAdminRefreshToken,
  verifyAdminRefreshToken,
} from './adminJwt';
import { BadRequestError, UnauthorizedError } from '../../../utils/src/errors';
import { logger } from '../../../utils/src/logger';

function mapAdminUser() {
  const admin = getPlatformAdmin();
  return {
    id: admin.id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
    permissions: admin.permissions,
    avatarUrl: undefined,
  };
}

export const adminAuthService = {
  async login(identifier: string, password: string, ipAddress?: string) {
    const email = identifier.trim().toLowerCase();
    if (!verifyPlatformAdminCredentials(email, password)) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const admin = getPlatformAdmin();
    const tokens = await generateAdminTokenPair(
      admin.id,
      admin.role,
      admin.email,
      admin.permissions,
    );

    await logActivity({
      actorId: PLATFORM_ADMIN_ID,
      actorName: admin.name,
      action: 'ADMIN_LOGIN',
      entityType: 'admin',
      entityId: admin.id,
      title: 'Admin signed in',
      ipAddress,
    });

    return {
      user: mapAdminUser(),
      tokens,
    };
  },

  async refreshToken(refreshToken: string) {
    const payload = verifyAdminRefreshToken(refreshToken);
    const valid = await isAdminRefreshTokenValid(payload.sub, payload.jti);
    if (!valid) {
      throw new UnauthorizedError('Refresh token revoked or expired');
    }

    if (payload.sub !== PLATFORM_ADMIN_ID) {
      throw new UnauthorizedError('Admin account not found');
    }

    const admin = getPlatformAdmin();
    await revokeAdminRefreshToken(payload.sub, payload.jti);
    return generateAdminTokenPair(admin.id, admin.role, admin.email, admin.permissions);
  },

  async logout(refreshToken?: string) {
    if (!refreshToken) return;
    try {
      const payload = verifyAdminRefreshToken(refreshToken);
      await revokeAdminRefreshToken(payload.sub, payload.jti);
    } catch {
      // ignore invalid logout tokens
    }
  },

  async getCurrentUser(adminId: string) {
    if (adminId !== PLATFORM_ADMIN_ID) {
      throw new UnauthorizedError('Admin not found');
    }
    return mapAdminUser();
  },

  async forgotPassword(email: string) {
    if (email.toLowerCase() !== env.ADMIN_EMAIL.toLowerCase()) {
      return { message: 'If the email exists, a reset link has been sent.' };
    }

    logger.info('Password reset requested for hardcoded admin — update ADMIN_PASSWORD in env', {
      email: env.ADMIN_EMAIL,
    });

    return { message: 'If the email exists, a reset link has been sent.' };
  },

  async resetPassword(_token: string, _password: string) {
    throw new BadRequestError('Update ADMIN_PASSWORD in server environment configuration');
  },

  async hashPassword(password: string) {
    return password;
  },

  async createAdmin() {
    throw new BadRequestError('Platform admin is hardcoded in server configuration');
  },
};
