import { API_CONFIG } from './api';

export const API_BASE_URL = API_CONFIG.baseUrl;

export const TOKEN_KEYS = {
  ACCESS: 'access_token',
  REFRESH: 'refresh_token',
} as const;

