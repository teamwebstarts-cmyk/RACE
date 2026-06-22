import { Role } from '@race/types';
import type { AdminUserListItem, RolePermissionCard } from '@race/types';

export const MOCK_ADMIN_USERS: AdminUserListItem[] = [
  {
    id: 'admin_1',
    name: 'Admin User',
    email: 'admin@raceservice.com',
    role: Role.SUPER_ADMIN,
    status: 'ACTIVE',
    lastLogin: '2025-06-17T10:30:00Z',
  },
  {
    id: 'admin_2',
    name: 'Operations Admin',
    email: 'ops@raceservice.com',
    role: Role.OPERATIONS_ADMIN,
    status: 'ACTIVE',
    lastLogin: '2025-06-17T09:15:00Z',
  },
  {
    id: 'admin_3',
    name: 'Bookings Manager',
    email: 'bookings@raceservice.com',
    role: Role.OPERATIONS_ADMIN,
    status: 'ACTIVE',
    lastLogin: '2025-06-16T18:45:00Z',
  },
  {
    id: 'admin_4',
    name: 'Verification Admin',
    email: 'verify@raceservice.com',
    role: Role.VERIFICATION_ADMIN,
    status: 'ACTIVE',
    lastLogin: '2025-06-16T14:20:00Z',
  },
  {
    id: 'admin_5',
    name: 'Finance Admin',
    email: 'finance@raceservice.com',
    role: Role.FINANCE_ADMIN,
    status: 'ACTIVE',
    lastLogin: '2025-06-15T11:00:00Z',
  },
  {
    id: 'admin_6',
    name: 'Support Admin',
    email: 'support@raceservice.com',
    role: Role.SUPPORT_ADMIN,
    status: 'INACTIVE',
    lastLogin: '2025-06-01T08:30:00Z',
  },
];

export const ROLE_CARDS: RolePermissionCard[] = [
  {
    role: Role.SUPER_ADMIN,
    title: 'Super Admin',
    permissions: ['Full Access', 'Manage Permissions', 'View All Reports', 'Manage Settings'],
  },
  {
    role: Role.OPERATIONS_ADMIN,
    title: 'Operations Admin',
    permissions: ['Manage Operations', 'View Bookings', 'Manage Drivers', 'View Reports'],
  },
  {
    role: Role.VERIFICATION_ADMIN,
    title: 'Verification Admin',
    permissions: ['Manage Verifications', 'View Vendors', 'View Drivers', 'Export Data'],
  },
  {
    role: Role.FINANCE_ADMIN,
    title: 'Finance Admin',
    permissions: ['Manage Financials', 'View Transactions', 'Export Reports', 'View Subscriptions'],
  },
];

export type AdminUserUpsertInput = {
  name: string;
  email: string;
  role: AdminUserListItem['role'];
  status?: AdminUserListItem['status'];
};

export function createAdminUserRecord(input: AdminUserUpsertInput): AdminUserListItem {
  const item: AdminUserListItem = {
    id: `admin_${MOCK_ADMIN_USERS.length + 1}`,
    name: input.name,
    email: input.email,
    role: input.role,
    status: input.status ?? 'ACTIVE',
    lastLogin: new Date().toISOString(),
  };
  MOCK_ADMIN_USERS.unshift(item);
  return item;
}

export function updateAdminUserRecord(
  id: string,
  input: Partial<AdminUserUpsertInput>,
): AdminUserListItem {
  const idx = MOCK_ADMIN_USERS.findIndex((u) => u.id === id);
  if (idx === -1) throw new Error('Admin user not found');
  MOCK_ADMIN_USERS[idx] = { ...MOCK_ADMIN_USERS[idx], ...input };
  return MOCK_ADMIN_USERS[idx];
}

export function deleteAdminUserRecord(id: string): void {
  const idx = MOCK_ADMIN_USERS.findIndex((u) => u.id === id);
  if (idx === -1) throw new Error('Admin user not found');
  if (MOCK_ADMIN_USERS[idx].email === 'admin@raceservice.com') {
    throw new Error('Cannot delete the primary super admin');
  }
  MOCK_ADMIN_USERS.splice(idx, 1);
}
