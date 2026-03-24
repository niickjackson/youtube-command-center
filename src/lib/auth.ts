import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const SESSION_SECRET = process.env.SESSION_SECRET || 'default-secret';
const SESSION_COOKIE = 'cc_session';

function sign(value: string): string {
  const hmac = crypto.createHmac('sha256', SESSION_SECRET);
  hmac.update(value);
  return value + '.' + hmac.digest('base64url');
}

function verify(signed: string): string | null {
  const idx = signed.lastIndexOf('.');
  if (idx === -1) return null;
  const value = signed.slice(0, idx);
  if (sign(value) === signed) return value;
  return null;
}

export async function login(password: string): Promise<boolean> {
  // Support base64-encoded hash (avoids $ mangling in env vars)
  const rawHash = process.env.ADMIN_PASSWORD_HASH;
  if (!rawHash) return false;
  const hash = rawHash.startsWith('$2') ? rawHash : Buffer.from(rawHash, 'base64').toString();
  const valid = await bcrypt.compare(password, hash);
  if (!valid) return false;

  const token = crypto.randomBytes(32).toString('hex');
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, sign(token), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
  return true;
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE);
  if (!session) return false;
  return verify(session.value) !== null;
}
