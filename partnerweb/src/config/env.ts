export const API_BASE_URL =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ||
  'http://localhost:3000';

export const TOKEN_KEYS = {
  ACCESS: 'access_token',
  REFRESH: 'refresh_token',
  AUTH_STATE: 'redux_auth_state',
} as const;

export const PARTNER_ROLE_KEY = 'partner_selected_role';
