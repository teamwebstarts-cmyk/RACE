import { AdminModel } from '../models/admin.model';
import { ActivityLogModel } from '../models/activity-log.model';
import { adminAuthService } from '../auth/admin-auth.service';
import { AdminRole, getPermissionsForRole } from '../shared/rbac';
import { paginate } from '../shared/pagination';
import { logActivity } from '../shared/activity-logger';
import { NotFoundError } from '../../../shared/utils/errors';

export const adminUsersService = {
  async list(filters: { page?: number; pageSize?: number; search?: string }) {
    const query: Record<string, unknown> = {};
    if (filters.search) {
      const regex = new RegExp(filters.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      query.$or = [{ name: regex }, { email: regex }];
    }
    return paginate(AdminModel, query, filters, (doc) => ({
      id: doc._id.toString(),
      name: doc.name,
      email: doc.email,
      role: doc.role,
      permissions: doc.permissions,
      isActive: doc.isActive,
      lastLoginAt: doc.lastLoginAt?.toISOString(),
      createdAt: doc.createdAt.toISOString(),
    }));
  },

  async create(input: {
    name: string;
    email: string;
    password: string;
    role: AdminRole;
  }, actor: { id: string; name: string }) {
    const user = await adminAuthService.createAdmin({
      ...input,
      permissions: getPermissionsForRole(input.role),
    });
    await logActivity({
      actorId: actor.id,
      actorName: actor.name,
      action: 'ADMIN_CREATED',
      entityType: 'admin',
      entityId: user.id,
      title: `Admin user ${user.name} created`,
    });
    return user;
  },

  async update(id: string, input: Partial<{ name: string; role: AdminRole; isActive: boolean }>, actor: { id: string; name: string }) {
    const admin = await AdminModel.findById(id);
    if (!admin) throw new NotFoundError('Admin not found');
    if (input.name) admin.name = input.name;
    if (input.role) {
      admin.role = input.role;
      admin.permissions = getPermissionsForRole(input.role);
    }
    if (input.isActive != null) admin.isActive = input.isActive;
    await admin.save();
    await logActivity({
      actorId: actor.id,
      actorName: actor.name,
      action: 'ADMIN_UPDATED',
      entityType: 'admin',
      entityId: id,
      title: `Admin user ${admin.name} updated`,
    });
    return {
      id: admin._id.toString(),
      name: admin.name,
      email: admin.email,
      role: admin.role,
      permissions: admin.permissions,
      isActive: admin.isActive,
    };
  },

  async remove(id: string, actor: { id: string; name: string }) {
    const admin = await AdminModel.findByIdAndDelete(id);
    if (!admin) throw new NotFoundError('Admin not found');
    await logActivity({
      actorId: actor.id,
      actorName: actor.name,
      action: 'ADMIN_DELETED',
      entityType: 'admin',
      entityId: id,
      title: `Admin user ${admin.name} deleted`,
    });
  },
};

export const adminActivityService = {
  async list(filters: { page?: number; pageSize?: number }) {
    return paginate(ActivityLogModel, {}, filters, (doc) => ({
      id: doc._id.toString(),
      actorName: doc.actorName,
      action: doc.action,
      entityType: doc.entityType,
      entityId: doc.entityId,
      title: doc.title,
      description: doc.description,
      createdAt: doc.createdAt.toISOString(),
    }));
  },
};
