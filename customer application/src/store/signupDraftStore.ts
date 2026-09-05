import { create } from 'zustand';

export type AuthOtpChannel = 'sms' | 'email';

export interface SignupDraft {
  fullName: string;
  email: string;
  phone: string;
}

interface SignupDraftState {
  draft: SignupDraft;
  setDraft: (partial: Partial<SignupDraft>) => void;
  clearDraft: () => void;
}

const emptyDraft: SignupDraft = {
  fullName: '',
  email: '',
  phone: '',
};

export const useSignupDraftStore = create<SignupDraftState>((set) => ({
  draft: emptyDraft,
  setDraft: (partial) =>
    set((state) => ({
      draft: { ...state.draft, ...partial },
    })),
  clearDraft: () => set({ draft: emptyDraft }),
}));
