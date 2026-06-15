import { API_ENDPOINTS } from '../../config/api';
import type { ApiSuccessResponse } from '../../types/auth';
import type { Brand, ServiceCategory } from '../../types/models';
import { apiClient } from '../api/apiClient';

export async function fetchServiceCatalog(): Promise<ServiceCategory[]> {
  const { data } = await apiClient.get<ApiSuccessResponse<ServiceCategory[]>>(
    API_ENDPOINTS.services,
  );
  return data.data;
}

export async function fetchBrandConfig(): Promise<Brand> {
  const { data } = await apiClient.get<ApiSuccessResponse<Brand>>(API_ENDPOINTS.brand);
  return data.data;
}
