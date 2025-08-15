// app/api/client/route.ts
import { NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';

/**
 * Strategy
 * --------
 * - Static slice (cached 30m): branding, contact, colours, aboutUs, categories, etc.
 * - Dynamic slice (no-store): open/close status, online/kiosk status, menuItems (incl. soldOut), etc.
 * We merge the two so the page can hit a single endpoint without re-fetching in child components.
 */

type AnyObj = Record<string, any>;
interface CombinedOut {
  client: AnyObj;        // static client fields with certain dynamic flags overridden below
  menuItems: AnyObj[];   // dynamic, no-store
  categories: AnyObj[];  // static (cached)
}

const UPSTREAM = process.env.MAXORDER_UPSTREAM!;
const HEADERS: HeadersInit = {
  'Content-Type': 'application/json',
  'x-api-key': process.env.MAXORDER_API_KEY!,
};
const BODY = JSON.stringify({ clientId: process.env.MAXORDER_CLIENT_ID! });

// ---- Helpers to normalize shapes safely ----
function pickClientStatic(data: AnyObj): AnyObj {
  const c = data.client ?? data ?? {};
  // Keep all client fields (branding, contact, aboutUs, colours, hours, images, etc.)
  // We'll override volatile status fields from the dynamic fetch below to avoid staleness.
  return c || {};
}
function pickCategories(data: AnyObj): AnyObj[] {
  const cats = data.categories ?? data.menu?.categories ?? [];
  return Array.isArray(cats) ? cats : [];
}
function pickMenuItems(data: AnyObj): AnyObj[] {
  const items = data.menuItems ?? data.menu?.menuItems ?? data.items ?? [];
  return Array.isArray(items) ? items : [];
}

// ---- STATIC (cached) fetch: 30 minutes ----
async function fetchStatic(): Promise<{ client: AnyObj; categories: AnyObj[] }> {
  const res = await fetch(UPSTREAM, {
    method: 'POST',
    headers: HEADERS,
    body: BODY,
    // Provide a generous ISR window for static bits
    next: { revalidate: 1800 }, // 30 minutes
  });
  if (!res.ok) throw new Error(`Upstream(static) ${res.status}`);
  const data = (await res.json()) as AnyObj;
  return {
    client: pickClientStatic(data),
    categories: pickCategories(data),
  };
}
const getCachedStatic = unstable_cache(fetchStatic, ['bootstrap-static-v1'], {
  revalidate: 1800,
});

// ---- DYNAMIC (no-store) fetch: always fresh ----
async function fetchDynamic(): Promise<{ clientFlags: Partial<AnyObj>; menuItems: AnyObj[] }> {
  const res = await fetch(UPSTREAM, {
    method: 'POST',
    headers: HEADERS,
    body: BODY,
    cache: 'no-store',              // do not cache time-sensitive bits
  });
  if (!res.ok) throw new Error(`Upstream(dynamic) ${res.status}`);
  const data = (await res.json()) as AnyObj;

  // Extract volatile flags from the latest payload
  const client = pickClientStatic(data);
  const clientFlags: Partial<AnyObj> = {
    openStatus: client.openStatus,
    onlineStatus: client.onlineStatus,
    kioskStatus: client.kioskStatus,
    // include any other live flags you rely on
  };

  return {
    clientFlags,
    menuItems: pickMenuItems(data),
  };
}

export async function GET() {
  try {
    // Fetch static (cached) + dynamic (fresh) in parallel
    const [stat, dyn] = await Promise.all([
      getCachedStatic(),
      fetchDynamic(),
    ]);

    // Merge: static client + override volatile fields with dynamic snapshot
    const clientMerged = { ...stat.client, ...dyn.clientFlags };

    const payload: CombinedOut = {
      client: clientMerged,
      categories: stat.categories,
      menuItems: dyn.menuItems,
    };

    return NextResponse.json(payload);
  } catch (err: any) {
    // If dynamic fails, fall back to static so the site still renders, but with empty menu
    try {
      const stat = await getCachedStatic();
      const payload: CombinedOut = {
        client: stat.client, // may contain stale flags
        categories: stat.categories,
        menuItems: [],
      };
      return NextResponse.json(payload, { status: 200, statusText: 'OK (dynamic fallback)' });
    } catch (e: any) {
      return NextResponse.json({ error: err?.message ?? 'Internal Error' }, { status: 500 });
    }
  }
}