import { images } from '../assets';

export type ComingSoonServiceId = 'emergency_repair' | 'vehicle_recovery';

export const COMING_SOON_SERVICES: Record<
  ComingSoonServiceId,
  {
    id: ComingSoonServiceId;
    title: string;
    tagline: string;
    startingPrice: number;
    image: number;
    highlights: Array<{ highlight: string; label: string }>;
    plannedFeatures: string[];
  }
> = {
  emergency_repair: {
    id: 'emergency_repair',
    title: 'Emergency Repair',
    tagline: 'On-spot mechanical help when your vehicle breaks down.',
    startingPrice: 499,
    image: images.homePopularRepair,
    highlights: [
      { highlight: 'Certified', label: 'Mechanics' },
      { highlight: 'Genuine', label: 'Parts' },
      { highlight: 'Same-day', label: 'Service' },
    ],
    plannedFeatures: [
      'Engine & electrical diagnostics',
      'AC & cooling system repair',
      'Brake, clutch & suspension fixes',
      'Battery & alternator replacement',
    ],
  },
  vehicle_recovery: {
    id: 'vehicle_recovery',
    title: 'Vehicle Recovery',
    tagline: 'Safe recovery and transport for accident or breakdown vehicles.',
    startingPrice: 999,
    image: images.homePopularRecovery,
    highlights: [
      { highlight: '24/7', label: 'Dispatch' },
      { highlight: 'Secure', label: 'Towing' },
      { highlight: 'Insurance', label: 'Support' },
    ],
    plannedFeatures: [
      'Accident & breakdown recovery',
      'Off-road and winch assistance',
      'Secure transport to workshop',
      'Insurance claim coordination',
    ],
  },
};

export function getComingSoonService(id: string) {
  return COMING_SOON_SERVICES[id as ComingSoonServiceId] ?? null;
}

export function isComingSoonServiceId(id: string): id is ComingSoonServiceId {
  return id in COMING_SOON_SERVICES;
}
