import type { AppSettings, AuditLogEntry, PaginatedResponse } from '@race/types';

import { apiGet, apiPut } from '../http';
import { DEFAULT_SETTINGS } from '../mocks/settings.mock';

export async function getSettings(): Promise<AppSettings> {
  const raw = await apiGet<{
    general?: {
      platformName?: string;
      supportEmail?: string;
      supportPhone?: string;
      timezone?: string;
      language?: string;
    };
    business?: { commissionRate?: number; bookingRadiusKm?: number; autoPayout?: boolean };
    appearance?: AppSettings['appearance'];
    notifications?: {
      emailEnabled?: boolean;
      smsEnabled?: boolean;
      pushEnabled?: boolean;
    };
  }>('/settings');

  return {
    ...DEFAULT_SETTINGS,
    general: {
      ...DEFAULT_SETTINGS.general,
      appName: raw.general?.platformName ?? DEFAULT_SETTINGS.general.appName,
      supportEmail: raw.general?.supportEmail ?? DEFAULT_SETTINGS.general.supportEmail,
      supportPhone: raw.general?.supportPhone ?? DEFAULT_SETTINGS.general.supportPhone,
      timezone: raw.general?.timezone ?? DEFAULT_SETTINGS.general.timezone,
      defaultLanguage: raw.general?.language ?? DEFAULT_SETTINGS.general.defaultLanguage,
    },
    payment: {
      ...DEFAULT_SETTINGS.payment,
      commissionRate: raw.business?.commissionRate ?? DEFAULT_SETTINGS.payment.commissionRate,
    },
    appearance: raw.appearance ?? DEFAULT_SETTINGS.appearance,
    notifications: {
      ...DEFAULT_SETTINGS.notifications,
      emailAlerts: raw.notifications?.emailEnabled ?? DEFAULT_SETTINGS.notifications.emailAlerts,
      smsAlerts: raw.notifications?.smsEnabled ?? DEFAULT_SETTINGS.notifications.smsAlerts,
      pushAlerts: raw.notifications?.pushEnabled ?? DEFAULT_SETTINGS.notifications.pushAlerts,
    },
  };
}

export async function saveSettings(settings: AppSettings): Promise<AppSettings> {
  await apiPut('/settings', {
    general: {
      platformName: settings.general.appName,
      supportEmail: settings.general.supportEmail,
      supportPhone: settings.general.supportPhone,
      timezone: settings.general.timezone,
      language: settings.general.defaultLanguage,
    },
    business: {
      commissionRate: settings.payment.commissionRate,
    },
    appearance: settings.appearance,
    notifications: {
      emailEnabled: settings.notifications.emailAlerts,
      smsEnabled: settings.notifications.smsAlerts,
      pushEnabled: settings.notifications.pushAlerts,
    },
  });
  return settings;
}

export async function resetSettings(): Promise<AppSettings> {
  return saveSettings(DEFAULT_SETTINGS);
}

export async function getAuditLogs(filters: Record<string, unknown> = {}): Promise<AuditLogEntry[]> {
  const result = await apiGet<PaginatedResponse<AuditLogEntry>>('/activity-logs', filters);
  return result.items;
}
