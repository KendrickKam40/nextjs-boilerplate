import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getAdminCookieName, verifySessionToken } from '@/lib/auth';
import { getVideoUrlsFromConfig, readAdminConfig, writeAdminConfig } from '@/lib/adminConfig';

function isValidUrl(url: string) {
  try {
    const u = new URL(url);
    return u.protocol === 'https:';
  } catch {
    return false;
  }
}

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getAdminCookieName())?.value;
  const payload = verifySessionToken(token);
  if (!payload) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}

export async function GET() {
  const config = await readAdminConfig();
  return NextResponse.json({ videoUrls: getVideoUrlsFromConfig(config) });
}

export async function POST(req: Request) {
  const authErr = await requireAdmin();
  if (authErr) return authErr;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const rawList = body?.videoUrls;
  if (!Array.isArray(rawList) || rawList.length === 0) {
    return NextResponse.json({ error: 'videoUrls must be a non-empty array' }, { status: 422 });
  }
  const cleaned = rawList
    .map((v: any) => (v || '').toString().trim())
    .filter(Boolean);
  if (cleaned.length === 0) {
    return NextResponse.json({ error: 'videoUrls must contain at least one URL' }, { status: 422 });
  }
  const invalid = cleaned.find((u: string) => !isValidUrl(u));
  if (invalid) {
    return NextResponse.json({ error: `Invalid https URL: ${invalid}` }, { status: 422 });
  }

  await writeAdminConfig({ videoUrls: cleaned });
  return NextResponse.json({ ok: true, videoUrls: cleaned });
}
