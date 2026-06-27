import { API_ENDPOINTS } from '../../config/api';
import type { ApiSuccessResponse } from '../../types/auth';
import type { SavedLocation, SavedLocationType } from '../../types/profile';
import { apiClient } from '../api/apiClient';

interface BackendLocation {
  id: string;
  label: string;
  type: 'home' | 'work' | 'other';
  address: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
  createdAt?: string;
}

function toMobileType(type: BackendLocation['type']): SavedLocationType {
  if (type === 'work') return 'office';
  if (type === 'home') return 'home';
  return 'custom';
}

function toBackendType(type: SavedLocationType): BackendLocation['type'] {
  if (type === 'office') return 'work';
  if (type === 'home') return 'home';
  return 'other';
}

function mapLocation(loc: BackendLocation): SavedLocation {
  return {
    id: loc.id,
    type: toMobileType(loc.type),
    label: loc.label,
    address: loc.address,
    latitude: loc.latitude,
    longitude: loc.longitude,
  };
}

export async function listSavedLocations(): Promise<SavedLocation[]> {
  const { data } = await apiClient.get<ApiSuccessResponse<BackendLocation[]>>(
    API_ENDPOINTS.savedLocations,
  );
  return data.data.map(mapLocation);
}

export async function createSavedLocation(
  payload: Omit<SavedLocation, 'id'>,
): Promise<SavedLocation> {
  const { data } = await apiClient.post<ApiSuccessResponse<BackendLocation>>(
    API_ENDPOINTS.savedLocations,
    {
      label: payload.label,
      type: toBackendType(payload.type),
      address: payload.address,
      latitude: payload.latitude,
      longitude: payload.longitude,
    },
  );
  return mapLocation(data.data);
}

export async function deleteSavedLocation(id: string): Promise<void> {
  await apiClient.delete(`${API_ENDPOINTS.savedLocations}/${id}`);
}
