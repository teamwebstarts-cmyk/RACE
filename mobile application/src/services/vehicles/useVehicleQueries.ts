import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { CreateVehicleRequest, UpdateVehicleRequest } from '../../types/vehicle';
import { getApiErrorMessage } from '../api/apiClient';
import {
  createVehicle,
  deleteVehicle,
  getVehicle,
  listVehicles,
  updateVehicle,
} from './vehicleApi';

export function useVehiclesQuery() {
  return useQuery({
    queryKey: ['vehicles'],
    queryFn: listVehicles,
  });
}

export function useVehicleQuery(id: string) {
  return useQuery({
    queryKey: ['vehicles', id],
    queryFn: () => getVehicle(id),
    enabled: Boolean(id),
  });
}

export function useCreateVehicleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateVehicleRequest) => createVehicle(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
}

export function useUpdateVehicleMutation(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateVehicleRequest) => updateVehicle(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      void queryClient.invalidateQueries({ queryKey: ['vehicles', id] });
    },
  });
}

export function useDeleteVehicleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteVehicle(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
}

export { getApiErrorMessage };
