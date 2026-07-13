import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

import { API_CONFIG, API_ENDPOINTS } from '../config/api';
import { API_BASE_URL } from '../config/env';
import type { ApiErrorResponse, ApiSuccessResponse } from '../types/auth';
import { notifyUnauthorized } from './authSession';
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  saveTokens,
} from './tokenStorage';

export { clearTokens, saveTokens };

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_CONFIG.timeoutMs,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let refreshQueue: Array<(token: string | null) => void> = [];

function processQueue(token: string | null) {
  refreshQueue.forEach((callback) => callback(token));
  refreshQueue = [];
}

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await getAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status !== 401 || !originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    const refreshToken = await getRefreshToken();
    if (!refreshToken) {
      await clearTokens();
      notifyUnauthorized();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push((token) => {
          if (!token) {
            reject(error);
            return;
          }
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          resolve(api(originalRequest));
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const response = await axios.post<
        ApiSuccessResponse<{ accessToken: string; refreshToken: string }>
      >(`${API_BASE_URL}${API_ENDPOINTS.refreshToken}`, { refreshToken });

      const { accessToken, refreshToken: newRefreshToken } = response.data.data;
      await saveTokens(accessToken, newRefreshToken);
      processQueue(accessToken);

      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      }
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(null);
      await clearTokens();
      notifyUnauthorized();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    if (error.code === 'ECONNABORTED' || error.message.toLowerCase().includes('timeout')) {
      return `Cannot reach backend at ${API_BASE_URL}. Start the backend and try again.`;
    }
    if (error.message === 'Network Error' || !error.response) {
      return `Network error — cannot reach ${API_BASE_URL}. Check CORS and that the API is running.`;
    }
    if (error.response?.status === 429) {
      return 'OTP limit reached. Try again in 1 hour.';
    }
    return error.response?.data?.message ?? error.message ?? fallback;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
}

export async function unwrapApi<T>(
  promise: Promise<{ data: ApiSuccessResponse<T> }>,
): Promise<T> {
  const response = await promise;
  return response.data.data;
}
