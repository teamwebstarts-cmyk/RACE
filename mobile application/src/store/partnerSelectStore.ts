import { create } from 'zustand';

interface OpenParams {
  title: string;
  options: string[];
  selectedValue?: string;
  onSelect: (value: string) => void;
}

interface PartnerSelectState {
  visible: boolean;
  title: string;
  options: string[];
  selectedValue?: string;
  onSelect: ((value: string) => void) | null;
  open: (params: OpenParams) => void;
  close: () => void;
  select: (value: string) => void;
}

export const usePartnerSelectStore = create<PartnerSelectState>((set, get) => ({
  visible: false,
  title: '',
  options: [],
  selectedValue: undefined,
  onSelect: null,
  open: ({ title, options, selectedValue, onSelect }) =>
    set({ visible: true, title, options, selectedValue, onSelect }),
  close: () => set({ visible: false, onSelect: null }),
  select: (value) => {
    get().onSelect?.(value);
    set({ visible: false, onSelect: null });
  },
}));
