import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { VendorDraft, VendorType } from '../../types/vendor';
import { getVendorConfig } from '../../data/vendorWizardConfig';

export interface VendorOnboardingState {
  activeVendorType: VendorType | null;
  currentStep: number;
  draft: VendorDraft | null;
}

const initialState: VendorOnboardingState = {
  activeVendorType: null,
  currentStep: 1,
  draft: null,
};

function createEmptyDraft(vendorType: VendorType, prefill?: Partial<VendorDraft>): VendorDraft {
  return {
    vendorType,
    ownerName: prefill?.ownerName ?? '',
    mobileNumber: prefill?.mobileNumber ?? '',
    email: prefill?.email,
    businessName: prefill?.businessName,
    address: prefill?.address,
    documents: [],
    acceptTerms: false,
    bankDetails: prefill?.bankDetails,
    towVehicle: prefill?.towVehicle,
    driverProfile: prefill?.driverProfile ?? {},
  };
}

const vendorOnboardingSlice = createSlice({
  name: 'vendorOnboarding',
  initialState,
  reducers: {
    startVendorWizard(
      state,
      action: PayloadAction<{ vendorType: VendorType; prefill?: Partial<VendorDraft> }>,
    ) {
      state.activeVendorType = action.payload.vendorType;
      state.currentStep = 1;
      state.draft = createEmptyDraft(action.payload.vendorType, action.payload.prefill);
    },
    setVendorStep(state, action: PayloadAction<number>) {
      const config = state.activeVendorType ? getVendorConfig(state.activeVendorType) : undefined;
      const max = config?.steps.length ?? 1;
      state.currentStep = Math.min(Math.max(action.payload, 1), max);
    },
    updateVendorDraft(state, action: PayloadAction<Partial<VendorDraft>>) {
      if (!state.draft) return;
      state.draft = { ...state.draft, ...action.payload };
    },
    upsertVendorDocument(
      state,
      action: PayloadAction<VendorDraft['documents'][number]>,
    ) {
      if (!state.draft) return;
      const idx = state.draft.documents.findIndex(
        (d) => d.documentType === action.payload.documentType,
      );
      if (idx >= 0) {
        state.draft.documents[idx] = action.payload;
      } else {
        state.draft.documents.push(action.payload);
      }
    },
    removeVendorDocument(state, action: PayloadAction<string>) {
      if (!state.draft) return;
      state.draft.documents = state.draft.documents.filter(
        (d) => d.documentType !== action.payload,
      );
    },
    resetVendorWizard(state) {
      state.activeVendorType = null;
      state.currentStep = 1;
      state.draft = null;
    },
  },
});

export const {
  startVendorWizard,
  setVendorStep,
  updateVendorDraft,
  upsertVendorDocument,
  removeVendorDocument,
  resetVendorWizard,
} = vendorOnboardingSlice.actions;

export default vendorOnboardingSlice.reducer;
