import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { CompleteProfileRequest } from '../../types/auth';
import type { VendorType } from '../../types/vendor';

export type SignupAccountType = 'customer' | 'vendor' | 'driver';

export interface OnboardingState {
  profileDraft: Partial<CompleteProfileRequest>;
  currentStep: number;
  vehicleOnboardingRequired: boolean;
  /** User chose partner signup (vendor or driver) before OTP */
  signupAccountType: SignupAccountType | null;
  signupVendorType: VendorType | null;
  /** After profile, user must complete vendor wizard + document verification */
  partnerSignupRequired: boolean;
  /** Marketing intro slides completed before auth */
  introSlidesCompleted: boolean;
}

const initialState: OnboardingState = {
  profileDraft: {},
  currentStep: 1,
  vehicleOnboardingRequired: false,
  signupAccountType: null,
  signupVendorType: null,
  partnerSignupRequired: false,
  introSlidesCompleted: false,
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
    setSignupPath(
      state,
      action: PayloadAction<{
        accountType: SignupAccountType;
        vendorType?: VendorType | null;
      }>,
    ) {
      state.signupAccountType = action.payload.accountType;
      state.signupVendorType = action.payload.vendorType ?? null;
      state.partnerSignupRequired =
        action.payload.accountType === 'vendor' || action.payload.accountType === 'driver';
    },
    clearSignupPath(state) {
      state.signupAccountType = null;
      state.signupVendorType = null;
      state.partnerSignupRequired = false;
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
    finishPartnerSignup(state) {
      state.partnerSignupRequired = false;
      state.signupAccountType = null;
      state.signupVendorType = null;
    },
    completeIntroSlides(state) {
      state.introSlidesCompleted = true;
    },
    resetOnboarding(state) {
      state.profileDraft = {};
      state.currentStep = 1;
      state.vehicleOnboardingRequired = false;
      state.signupAccountType = null;
      state.signupVendorType = null;
      state.partnerSignupRequired = false;
      state.introSlidesCompleted = false;
    },
  },
});

export const {
  setProfileDraft,
  setCurrentStep,
  setSignupPath,
  clearSignupPath,
  startVehicleOnboarding,
  finishVehicleOnboarding,
  finishPartnerSignup,
  completeIntroSlides,
  resetOnboarding,
} = onboardingSlice.actions;

export default onboardingSlice.reducer;
