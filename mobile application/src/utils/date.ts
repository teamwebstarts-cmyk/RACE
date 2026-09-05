import { normalizeDateOfBirth } from './profilePayload';

export function formatDateApi(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDob(value: string): Date {
  const normalized = normalizeDateOfBirth(value);
  if (normalized) {
    const [year, month, day] = normalized.split('-').map(Number);
    return new Date(year, month - 1, day);
  }
  return new Date(1998, 4, 12);
}

export const DOB_MIN_DATE = new Date(1940, 0, 1);

export function getDobMaxDate(): Date {
  const today = new Date();
  return new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
}
