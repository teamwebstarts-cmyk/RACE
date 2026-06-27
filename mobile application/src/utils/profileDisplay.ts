export function getProfileFirstName(fullName?: string): string {
  const trimmed = fullName?.trim();
  if (!trimmed) return '';
  return trimmed.split(/\s+/)[0] ?? '';
}

export function getProfileInitial(fullName?: string): string {
  const firstName = getProfileFirstName(fullName);
  return firstName ? firstName.charAt(0).toUpperCase() : '';
}
