import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

export async function hashDriverPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifyDriverPassword(plain: string, passwordHash: string): Promise<boolean> {
  return bcrypt.compare(plain, passwordHash);
}

export function normalizeDriverLoginId(loginId: string): string {
  return loginId.trim().toLowerCase();
}
