import { API_ENDPOINTS } from '../../config/api';
import type { ApiSuccessResponse } from '../../types/auth';
import { apiClient } from '../api/apiClient';

export interface SosConfig {
  supportPhone: string;
  emergencyPhone: string;
  avgArrivalMinutes: number;
  trustIndicators: Array<{ label: string; value: string }>;
}

export interface SosContext {
  owner: { name?: string; phone?: string };
  emergencyContact?: { name: string; mobileNumber: string; relationship?: string };
  vehicle?: {
    id: string;
    label: string;
    number: string;
    color?: string;
    fuelType?: string;
  };
  emergencyNumber: string;
}

export type SosAction = 'sos' | 'towing' | 'ambulance' | 'share_location' | 'notify_contacts';

export async function getSosConfig(): Promise<SosConfig> {
  const { data } = await apiClient.get<ApiSuccessResponse<SosConfig>>(API_ENDPOINTS.sosConfig);
  return data.data;
}

export async function getSosContext(vehicleId?: string): Promise<SosContext> {
  const { data } = await apiClient.get<ApiSuccessResponse<SosContext>>(API_ENDPOINTS.sosContext, {
    params: vehicleId ? { vehicleId } : undefined,
  });
  return data.data;
}

export async function triggerSosAlert(payload: {
  action: SosAction;
  vehicleId?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
}): Promise<{ message: string; emergencyNumber: string }> {
  const { data } = await apiClient.post<
    ApiSuccessResponse<{ message: string; emergencyNumber: string }>
  >(API_ENDPOINTS.sosAlert, payload);
  return data.data;
}
