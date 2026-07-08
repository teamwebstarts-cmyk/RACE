import { getPlatformAdmin } from '../../../config/hardcoded-admin';
import { ActivityLogModel } from '../models/activity-log.model';
import { BadRequestError } from '../../../shared/utils/errors';
import { paginate } from '../shared/pagination';

export const adminUsersService = {
  async list(filters: { page?: number; pageSize?: number; search?: string }) {
    const admin = getPlatformAdmin();
    const items = [
      {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
        isActive: admin.isActive,
        lastLoginAt: undefined,
        createdAt: new Date(0).toISOString(),
      },
    ];

    if (filters.search) {
      const regex = new RegExp(filters.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      if (!regex.test(admin.name) && !regex.test(admin.email)) {
        return { items: [], total: 0, page: 1, pageSize: filters.pageSize ?? 10, totalPages: 1 };
      }
    }

    return {
      items,
      total: 1,
      page: 1,
      pageSize: filters.pageSize ?? 10,
      totalPages: 1,
    };
  },

  async create(
    _input?: unknown,
    _actor?: { id: string; name: string },
  ) {
    throw new BadRequestError('Platform admin is hardcoded in server configuration');
  },

  async update(
    _id?: string,
    _input?: unknown,
    _actor?: { id: string; name: string },
  ) {
    throw new BadRequestError('Platform admin is hardcoded in server configuration');
  },

  async remove(
    _id?: string,
    _actor?: { id: string; name: string },
  ) {
    throw new BadRequestError('Platform admin is hardcoded in server configuration');
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
