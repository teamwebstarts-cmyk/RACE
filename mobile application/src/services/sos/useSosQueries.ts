import { useMutation, useQuery } from '@tanstack/react-query';

import { getSosConfig, getSosContext, triggerSosAlert, type SosAction } from './sosApi';

export const sosKeys = {
  config: ['sos', 'config'] as const,
  context: (vehicleId?: string) => ['sos', 'context', vehicleId ?? 'default'] as const,
};

export function useSosConfigQuery() {
  return useQuery({
    queryKey: sosKeys.config,
    queryFn: getSosConfig,
    staleTime: 5 * 60_000,
  });
}

export function useSosContextQuery(vehicleId?: string) {
  return useQuery({
    queryKey: sosKeys.context(vehicleId),
    queryFn: () => getSosContext(vehicleId),
  });
}

export function useSosAlertMutation() {
  return useMutation({
    mutationFn: (payload: {
      action: SosAction;
      vehicleId?: string;
      latitude?: number;
      longitude?: number;
      address?: string;
    }) => triggerSosAlert(payload),
  });
}
