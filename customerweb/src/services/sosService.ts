import { API_ENDPOINTS } from '../config/api';
import { api, unwrapApi } from './api';

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
  return unwrapApi(api.get(API_ENDPOINTS.sosConfig));
}

export async function getSosContext(vehicleId?: string): Promise<SosContext> {
  return unwrapApi(
    api.get(API_ENDPOINTS.sosContext, {
      params: vehicleId ? { vehicleId } : undefined,
    }),
  );
}

export async function triggerSosAlert(payload: {
  action: SosAction;
  vehicleId?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
}): Promise<{ message: string; emergencyNumber: string }> {
  return unwrapApi(api.post(API_ENDPOINTS.sosAlert, payload));
}
