import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getAdminCookieName, verifySessionToken } from './auth';

/** Returns a 401 response for API routes when the admin session is missing or expired. */
export async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getAdminCookieName())?.value;
  if (verifySessionToken(token)) return null;
  return NextResponse.json({ error: 'You’ve been signed out. Sign in again to save.' }, { status: 401 });
}
