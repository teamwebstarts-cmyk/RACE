import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { CompleteProfileRequest } from '../../types/auth';

export interface OnboardingState {
  profileDraft: Partial<CompleteProfileRequest>;
  currentStep: number;
  vehicleOnboardingRequired: boolean;
}

const initialState: OnboardingState = {
  profileDraft: {},
  currentStep: 1,
  vehicleOnboardingRequired: false,
};

const onboardingSlice = createSlice({
  name: 'onboarding',
  initialState,
  reducers: {
    setProfileDraft(state, action: PayloadAction<Partial<CompleteProfileRequest>>) {
      state.profileDraft = { ...state.profileDraft, ...action.payload };
    },
    setCurrentStep(state, action: PayloadAction<number>) {
      state.currentStep = action.payload;
    },
    startVehicleOnboarding(state) {
      state.vehicleOnboardingRequired = true;
      state.currentStep = 1;
    },
    finishVehicleOnboarding(state) {
      state.vehicleOnboardingRequired = false;
      state.profileDraft = {};
      state.currentStep = 1;
    },
    resetOnboarding(state) {
      state.profileDraft = {};
      state.currentStep = 1;
      state.vehicleOnboardingRequired = false;
    },
  },
});

export const {
  setProfileDraft,
  setCurrentStep,
  startVehicleOnboarding,
  finishVehicleOnboarding,
  resetOnboarding,
} = onboardingSlice.actions;

export default onboardingSlice.reducer;
