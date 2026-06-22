export const appConfig = {
  appName: 'RACE Admin Panel',
  apiBaseUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1',
  adminApiPrefix: '/admin',
  tokenStorageKey: 'race_admin_token',
  refreshTokenStorageKey: 'race_admin_refresh_token',
  defaultPageSize: 10,
  mockApiDelayMs: 600,
} as const;
