/**
 * Uniform short address for booking UI (pickup / drop / history / payment).
 * Strips noisy Google trailing parts (pincode, state, India) and keeps ~2 segments.
 */
export function formatReadableAddress(
  address: string | undefined | null,
  maxLen = 48,
): string {
  if (!address?.trim()) return '—';

  const parts = address
    .split(',')
    .map(part => part.trim())
    .filter(Boolean);

  const cleaned = parts.filter(part => {
    const lower = part.toLowerCase();
    if (lower === 'india') return false;
    if (/^\d{6}$/.test(part)) return false;
    if (lower === 'odisha' || lower === 'orissa') return false;
    if (/^[a-z\s]+ \d{6}$/i.test(part)) return false;
    return true;
  });

  let result = cleaned.slice(0, 2).join(', ');
  if (!result) {
    result = parts[0] ?? address.trim();
  }

  if (result.length > maxLen) {
    return `${result.slice(0, maxLen - 1).trim()}…`;
  }

  return result;
}
