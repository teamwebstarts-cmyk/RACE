import { describe, expect, it } from 'vitest';

import { hasPermission, formatCurrency } from '@race/utils';
import { Permission } from '@race/types';

describe('dashboard utils', () => {
  it('formats currency in INR', () => {
    expect(formatCurrency(1845300)).toContain('18');
  });

  it('checks permissions', () => {
    expect(hasPermission([Permission.DASHBOARD_VIEW], Permission.DASHBOARD_VIEW)).toBe(true);
    expect(hasPermission([Permission.DASHBOARD_VIEW], Permission.FINANCE_VIEW)).toBe(false);
  });
});
