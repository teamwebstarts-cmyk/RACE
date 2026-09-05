import { create } from 'zustand';

export type PartnerRole = 'vendor' | 'driver';

interface PartnerOnboardingState {
  selectedRole: PartnerRole | null;
  setSelectedRole: (role: PartnerRole | null) => void;
  clearSelectedRole: () => void;
}

export const usePartnerOnboardingStore = create<PartnerOnboardingState>((set) => ({
  selectedRole: null,
  setSelectedRole: (role) => set({ selectedRole: role }),
  clearSelectedRole: () => set({ selectedRole: null }),
}));
