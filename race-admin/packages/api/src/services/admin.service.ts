import type { AdminUserListItem, PaginatedResponse, Role } from '@race/types';
import { ROLE_PERMISSIONS } from '@race/constants';

import { apiDelete, apiGet, apiPatch, apiPost } from '../http';

const ROLE_CARDS = Object.entries(ROLE_PERMISSIONS).map(([role, permissions]) => ({
  role: role as Role,
  title: role.replace(/_/g, ' '),
  permissions: permissions.map((p) => p.replace(/_/g, ' ')),
}));

export async function getAdminUsersData(filters: { page?: number; pageSize?: number } = {}) {
  const users = await apiGet<PaginatedResponse<{
    id: string;
    name: string;
    email: string;
    role: string;
    status?: string;
    isActive?: boolean;
    lastLoginAt?: string;
  }>>('/admins', filters as Record<string, unknown>);

  return {
    users: users.items.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role as Role,
      status: (u.status ??
        (u.isActive === false ? 'INACTIVE' : 'ACTIVE')) as AdminUserListItem['status'],
      lastLogin: u.lastLoginAt ?? '—',
    })),
    roles: ROLE_CARDS,
    pagination: users,
  };
}

export async function createAdminUser(input: Record<string, string>) {
  return apiPost('/admins', {
    ...input,
    isActive: input.status !== 'INACTIVE',
  });
}

export async function updateAdminUser(id: string, input: Record<string, string>) {
  return apiPatch(`/admins/${id}`, {
    name: input.name,
    role: input.role,
    isActive: input.status !== 'INACTIVE',
  });
}

export async function deleteAdminUser(id: string) {
  await apiDelete(`/admins/${id}`);
}
