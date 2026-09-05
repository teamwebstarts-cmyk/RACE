import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

import { appConfig } from '@race/config';
import type { ApiErrorResponse, ApiSuccessResponse, AuthTokens } from '@race/types';

let accessToken: string | null = null;
let getRefreshToken: (() => string | null) | null = null;
let onTokenRefreshed: ((tokens: AuthTokens) => void) | null = null;
let onSessionExpired: (() => void) | null = null;
let isRefreshing = false;
let refreshQueue: Array<(token: string | null) => void> = [];

const refreshClient = axios.create({
  baseURL: appConfig.apiBaseUrl,
  timeout: 15000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

export function configureAuthHandlers(handlers: {
  getRefreshToken: () => string | null;
  onTokenRefreshed: (tokens: AuthTokens) => void;
  onSessionExpired: () => void;
}) {
  getRefreshToken = handlers.getRefreshToken;
  onTokenRefreshed = handlers.onTokenRefreshed;
  onSessionExpired = handlers.onSessionExpired;
}

function processRefreshQueue(token: string | null) {
  refreshQueue.forEach((callback) => callback(token));
  refreshQueue = [];
}

export const apiClient = axios.create({
  baseURL: appConfig.apiBaseUrl,
  timeout: 15000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (accessToken && config.headers) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const status = error.response?.status;

    if (
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/admin/auth/login') &&
      !originalRequest.url?.includes('/admin/auth/refresh-token')
    ) {
      const refreshToken = getRefreshToken?.() ?? null;
      if (!refreshToken) {
        onSessionExpired?.();
        return Promise.reject(new Error('Session expired. Please sign in again.'));
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push((token) => {
            if (!token || !originalRequest.headers) {
              reject(new Error('Session expired. Please sign in again.'));
              return;
            }
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(apiClient(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await refreshClient.post<ApiSuccessResponse<{ tokens: AuthTokens }>>(
          '/admin/auth/refresh-token',
          { refreshToken },
        );
        const tokens = data.data.tokens;
        setAccessToken(tokens.accessToken);
        onTokenRefreshed?.(tokens);
        processRefreshQueue(tokens.accessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
        }
        return apiClient(originalRequest);
      } catch {
        processRefreshQueue(null);
        onSessionExpired?.();
        return Promise.reject(new Error('Session expired. Please sign in again.'));
      } finally {
        isRefreshing = false;
      }
    }

    const message = error.response?.data?.message ?? error.message ?? 'Request failed';
    return Promise.reject(new Error(message));
  },
);

export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (error instanceof Error) return error.message;
  return fallback;
}
