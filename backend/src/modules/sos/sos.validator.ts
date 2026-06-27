import { z } from 'zod';

export const sosAlertSchema = z.object({
  vehicleId: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  address: z.string().optional(),
  action: z.enum(['sos', 'towing', 'ambulance', 'share_location', 'notify_contacts']),
  contactId: z.string().optional(),
});

export type SosAlertDto = z.infer<typeof sosAlertSchema>;

export interface SosResponseDto {
  alertId: string;
  action: string;
  message: string;
  emergencyNumber: string;
  notifiedContacts?: string[];
}

export interface AppConfigDto {
  supportPhone: string;
  emergencyPhone: string;
  avgArrivalMinutes: number;
  trustIndicators: { label: string; value: string }[];
}
