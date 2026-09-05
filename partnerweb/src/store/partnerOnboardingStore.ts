import { create } from 'zustand';

import type { PartnerRole } from '../types/partner';
import { clearPartnerRole, getPartnerRole, setPartnerRole } from '../services/tokenStorage';

interface PartnerOnboardingState {
  selectedRole: PartnerRole | null;
  setSelectedRole: (role: PartnerRole | null) => void;
  clearSelectedRole: () => void;
  hydrateRole: () => void;
}

export const usePartnerOnboardingStore = create<PartnerOnboardingState>((set) => ({
  selectedRole: getPartnerRole(),
  setSelectedRole: (role) => {
    setPartnerRole(role);
    set({ selectedRole: role });
  },
  clearSelectedRole: () => {
    clearPartnerRole();
    set({ selectedRole: null });
  },
  hydrateRole: () => set({ selectedRole: getPartnerRole() }),
}));
