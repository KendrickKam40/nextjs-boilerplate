import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-guard';
import { readThemeOverrides, sanitizeThemeOverrides, writeThemeOverrides } from '@/lib/theme';

// The public site applies only these owner overrides (lib/site-theme.ts), so the
// editor no longer depends on the POS being reachable.

export async function GET() {
  const authErr = await requireAdmin();
  if (authErr) return authErr;

  try {
    const overrides = await readThemeOverrides();
    return NextResponse.json({ overrides });
  } catch (error) {
    console.error('[admin/theme] read failed', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: 'Colours can’t be loaded right now. Try again in a minute.' }, { status: 503 });
  }
}

export async function POST(req: Request) {
  const authErr = await requireAdmin();
  if (authErr) return authErr;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Something went wrong sending your colours. Try saving again.' }, { status: 400 });
  }

  try {
    if (body?.action === 'reset') {
      await writeThemeOverrides({});
      return NextResponse.json({ ok: true, overrides: {} });
    }

    const rawOverrides = body?.overrides ?? body ?? {};
    const sanitized = sanitizeThemeOverrides(rawOverrides);
    const saved = await writeThemeOverrides(sanitized);
    return NextResponse.json({ ok: true, overrides: saved });
  } catch (error) {
    console.error('[admin/theme] write failed', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: 'Your colours weren’t saved. Try again in a minute.' }, { status: 503 });
  }
}
