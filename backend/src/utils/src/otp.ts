import crypto from 'crypto';

export function generateOtp(): string {
  return crypto.randomInt(100000, 999999).toString();
}

export function normalizeMobileNumber(mobile: string): string {
  const digits = mobile.replace(/\D/g, '');

  if (digits.length === 10) {
    return `+91${digits}`;
  }

  if (digits.length === 12 && digits.startsWith('91')) {
    return `+${digits}`;
  }

  if (mobile.startsWith('+') && digits.length >= 10) {
    return `+${digits}`;
  }

  return mobile;
}

export function isValidIndianMobile(mobile: string): boolean {
  const normalized = normalizeMobileNumber(mobile);
  return /^\+91[6-9]\d{9}$/.test(normalized);
}
