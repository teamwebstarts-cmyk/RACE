import {
  createAdminUserRecord,
  deleteAdminUserRecord,
  MOCK_ADMIN_USERS,
  ROLE_CARDS,
  updateAdminUserRecord,
  type AdminUserUpsertInput,
} from '../mocks/admin.mock';
import type { AdminUserListItem, AdminUsersData } from '@race/types';
import { delay } from '@race/utils';
import { appConfig } from '@race/config';

export async function getAdminUsersData(): Promise<AdminUsersData> {
  await delay(appConfig.mockApiDelayMs);
  return { users: MOCK_ADMIN_USERS, roles: ROLE_CARDS };
}

export async function createAdminUser(input: AdminUserUpsertInput): Promise<AdminUserListItem> {
  await delay(appConfig.mockApiDelayMs);
  return createAdminUserRecord(input);
}

export async function updateAdminUser(
  id: string,
  input: Partial<AdminUserUpsertInput>,
): Promise<AdminUserListItem> {
  await delay(appConfig.mockApiDelayMs);
  return updateAdminUserRecord(id, input);
}

export async function deleteAdminUser(id: string): Promise<void> {
  await delay(appConfig.mockApiDelayMs);
  deleteAdminUserRecord(id);
}
