import type { AppSettings, AuditLogEntry } from '@race/types';
import { delay } from '@race/utils';
import { appConfig } from '@race/config';

import {
  getSettingsState,
  MOCK_AUDIT_LOGS,
  resetSettingsState,
  updateSettingsState,
} from '../mocks/settings.mock';

export async function getSettings(): Promise<AppSettings> {
  await delay(appConfig.mockApiDelayMs);
  return structuredClone(getSettingsState());
}

export async function saveSettings(settings: AppSettings): Promise<AppSettings> {
  await delay(500);
  updateSettingsState(settings);
  return structuredClone(getSettingsState());
}

export async function resetSettings(): Promise<AppSettings> {
  await delay(300);
  resetSettingsState();
  return structuredClone(getSettingsState());
}

export async function getAuditLogs(): Promise<AuditLogEntry[]> {
  await delay(300);
  return [...MOCK_AUDIT_LOGS];
}
