import { describe, expect, it } from 'vitest';

import { hasPermission } from '@race/utils';
import { Permission } from '@race/types';

describe('permissions', () => {
  it('grants access when user has required permission', () => {
    const perms = [Permission.DASHBOARD_VIEW, Permission.CUSTOMERS_VIEW];
    expect(hasPermission(perms, Permission.DASHBOARD_VIEW)).toBe(true);
  });

  it('denies access when permission is missing', () => {
    const perms = [Permission.DASHBOARD_VIEW];
    expect(hasPermission(perms, Permission.FINANCE_VIEW)).toBe(false);
  });
});
