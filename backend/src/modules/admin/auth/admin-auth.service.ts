import crypto from 'crypto';

import bcrypt from 'bcryptjs';

import { env } from '../../../configs/env';
import { AdminModel } from '../models/admin.model';
import { getPermissionsForRole } from '../shared/rbac';
import {
  generateAdminTokenPair,
  isAdminRefreshTokenValid,
  revokeAdminRefreshToken,
  verifyAdminRefreshToken,
} from '../shared/admin-jwt';
import { logActivity } from '../shared/activity-logger';
import { BadRequestError, UnauthorizedError } from '../../../shared/utils/errors';
import { logger } from '../../../shared/utils/logger';

function mapAdminUser(admin: {
  _id: { toString(): string };
  name: string;
  email: string;
  role: string;
  permissions: string[];
  avatarUrl?: string;
}) {
  return {
    id: admin._id.toString(),
    name: admin.name,
    email: admin.email,
    role: admin.role,
    permissions: admin.permissions,
    avatarUrl: admin.avatarUrl,
  };
}

export const adminAuthService = {
  async login(identifier: string, password: string, ipAddress?: string) {
    const email = identifier.trim().toLowerCase();
    const admin = await AdminModel.findOne({ email, isActive: true }).select('+passwordHash');

    if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
      throw new UnauthorizedError('Invalid email or password');
    }

    admin.lastLoginAt = new Date();
    await admin.save();

    const tokens = await generateAdminTokenPair(
      admin._id.toString(),
      admin.role,
      admin.email,
      admin.permissions,
    );

    await logActivity({
      actorId: admin._id,
      actorName: admin.name,
      action: 'ADMIN_LOGIN',
      entityType: 'admin',
      entityId: admin._id.toString(),
      title: 'Admin signed in',
      ipAddress,
    });

    return {
      user: mapAdminUser(admin),
      tokens,
    };
  },

  async refreshToken(refreshToken: string) {
    const payload = verifyAdminRefreshToken(refreshToken);
    const valid = await isAdminRefreshTokenValid(payload.sub, payload.jti);
    if (!valid) {
      throw new UnauthorizedError('Refresh token revoked or expired');
    }

    const admin = await AdminModel.findById(payload.sub);
    if (!admin || !admin.isActive) {
      throw new UnauthorizedError('Admin account not found');
    }

    await revokeAdminRefreshToken(payload.sub, payload.jti);
    return generateAdminTokenPair(admin._id.toString(), admin.role, admin.email, admin.permissions);
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
    const admin = await AdminModel.findById(adminId);
    if (!admin || !admin.isActive) {
      throw new UnauthorizedError('Admin not found');
    }
    return mapAdminUser(admin);
  },

  async forgotPassword(email: string) {
    const admin = await AdminModel.findOne({ email: email.toLowerCase(), isActive: true }).select(
      '+passwordResetToken +passwordResetExpires',
    );
    if (!admin) {
      return { message: 'If the email exists, a reset link has been sent.' };
    }

    const token = crypto.randomBytes(32).toString('hex');
    admin.passwordResetToken = crypto.createHash('sha256').update(token).digest('hex');
    admin.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
    await admin.save();

    const resetUrl = `${env.ADMIN_WEB_URL}/reset-password?token=${token}`;
    logger.info('Password reset link generated', { email: admin.email, resetUrl });

    return { message: 'If the email exists, a reset link has been sent.' };
  },

  async resetPassword(token: string, password: string) {
    const hashed = crypto.createHash('sha256').update(token).digest('hex');
    const admin = await AdminModel.findOne({
      passwordResetToken: hashed,
      passwordResetExpires: { $gt: new Date() },
      isActive: true,
    }).select('+passwordResetToken +passwordResetExpires +passwordHash');

    if (!admin) {
      throw new BadRequestError('Invalid or expired reset token');
    }

    admin.passwordHash = await bcrypt.hash(password, 12);
    admin.passwordResetToken = undefined;
    admin.passwordResetExpires = undefined;
    await admin.save();

    return { message: 'Password updated successfully' };
  },

  async hashPassword(password: string) {
    return bcrypt.hash(password, 12);
  },

  async createAdmin(input: {
    name: string;
    email: string;
    password: string;
    role: string;
    permissions?: string[];
  }) {
    const permissions =
      input.permissions?.length ? input.permissions : getPermissionsForRole(input.role as never);

    const admin = await AdminModel.create({
      name: input.name,
      email: input.email.toLowerCase(),
      passwordHash: await bcrypt.hash(input.password, 12),
      role: input.role,
      permissions,
      isActive: true,
    });

    return mapAdminUser(admin);
  },
};
