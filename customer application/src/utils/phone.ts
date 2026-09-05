export function getPhoneDigits(phone: string): string {
  return phone.replace(/\D/g, '').slice(-10);
}

export function formatIndianPhone(digits: string): string {
  const d = getPhoneDigits(digits);
  if (d.length <= 5) return d;
  return `${d.slice(0, 5)} ${d.slice(5)}`;
}

export function formatPhoneE164(digits: string): string {
  return `+91 ${formatIndianPhone(digits)}`;
}

export function isValidIndianMobile(digits: string): boolean {
  return getPhoneDigits(digits).length === 10;
}
