import { usePartnerSelectStore } from '../store/partnerSelectStore';

export function showSelectOptions(
  title: string,
  options: readonly string[],
  onSelect: (value: string) => void,
  selectedValue?: string,
) {
  usePartnerSelectStore.getState().open({
    title,
    options: [...options],
    selectedValue,
    onSelect,
  });
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function isValidIndianPin(value: string): boolean {
  return /^\d{6}$/.test(value.trim());
}
