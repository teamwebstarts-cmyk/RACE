import axios from 'axios';

/** Backend ConflictError when a verified number is locked to another role. */
export function isRoleMismatchError(error: unknown): boolean {
  if (!axios.isAxiosError(error) || error.response?.status !== 409) {
    return false;
  }
  const message = String(
    (error.response?.data as { message?: string } | undefined)?.message ?? '',
  ).toLowerCase();
  return (
    message.includes('registered as a') ||
    message.includes('cannot access the') ||
    message.includes('use the correct app')
  );
}

export function getRoleMismatchMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const apiMessage = (error.response?.data as { message?: string } | undefined)?.message;
    if (apiMessage) {
      return apiMessage;
    }
  }
  return fallback;
}
