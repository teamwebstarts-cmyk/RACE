import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { AUTH_USER, DEMO_VEHICLE } from '../constants/auth';
import { SOS_EMERGENCY_CONTACT, SOS_LOCATION } from '../constants/sosTheme';
import type { SosDetails } from '../types/sos';

const DEFAULT_SOS_DETAILS: SosDetails = {
  ownerName: AUTH_USER.name,
  ownerPhone: AUTH_USER.phone,
  vehicleBrand: DEMO_VEHICLE.brand,
  vehicleModel: DEMO_VEHICLE.model,
  vehicleNumber: DEMO_VEHICLE.number,
  contactName: SOS_EMERGENCY_CONTACT.name,
  contactRelation: SOS_EMERGENCY_CONTACT.relation,
  contactPhone: SOS_EMERGENCY_CONTACT.phone,
  location: SOS_LOCATION,
};

interface SosDetailsContextValue {
  details: SosDetails;
  updateDetails: (patch: Partial<SosDetails>) => void;
  setDetails: (details: SosDetails) => void;
}

const SosDetailsContext = createContext<SosDetailsContextValue | undefined>(undefined);

export function SosDetailsProvider({ children }: { children: ReactNode }) {
  const [details, setDetailsState] = useState<SosDetails>(DEFAULT_SOS_DETAILS);

  const updateDetails = useCallback((patch: Partial<SosDetails>) => {
    setDetailsState(prev => ({ ...prev, ...patch }));
  }, []);

  const setDetails = useCallback((next: SosDetails) => {
    setDetailsState(next);
  }, []);

  const value = useMemo(
    () => ({ details, updateDetails, setDetails }),
    [details, updateDetails, setDetails],
  );

  return <SosDetailsContext.Provider value={value}>{children}</SosDetailsContext.Provider>;
}

export function useSosDetails() {
  const context = useContext(SosDetailsContext);
  if (!context) {
    throw new Error('useSosDetails must be used within SosDetailsProvider');
  }
  return context;
}
