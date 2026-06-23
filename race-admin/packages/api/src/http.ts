import type { ApiSuccessResponse } from '@race/types';

import { apiClient } from './client';

const ADMIN = '/admin';

export async function apiGet<T>(path: string, params?: Record<string, unknown>): Promise<T> {
  const { data } = await apiClient.get<ApiSuccessResponse<T>>(`${ADMIN}${path}`, { params });
  return data.data;
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const { data } = await apiClient.post<ApiSuccessResponse<T>>(`${ADMIN}${path}`, body);
  return data.data;
}

export async function apiPatch<T>(path: string, body?: unknown): Promise<T> {
  const { data } = await apiClient.patch<ApiSuccessResponse<T>>(`${ADMIN}${path}`, body);
  return data.data;
}

export async function apiPut<T>(path: string, body?: unknown): Promise<T> {
  const { data } = await apiClient.put<ApiSuccessResponse<T>>(`${ADMIN}${path}`, body);
  return data.data;
}

export async function apiDelete<T>(path: string): Promise<T> {
  const { data } = await apiClient.delete<ApiSuccessResponse<T>>(`${ADMIN}${path}`);
  return data.data;
}

export async function apiAuthPost<T>(path: string, body?: unknown): Promise<T> {
  const { data } = await apiClient.post<ApiSuccessResponse<T>>(`/admin/auth${path}`, body);
  return data.data;
}
