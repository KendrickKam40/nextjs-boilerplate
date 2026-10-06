// app/api/client/route.ts
import { NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import { extractTheme, mergeTheme, readThemeOverrides } from '@/lib/theme';
import { DEFAULT_LAYOUTS, SITE_LAYOUT_TAG } from '@/lib/layout-config';
import { readCurrentLayout } from '@/lib/layout';
import { fetchMaxorder, isMaxorderConfigured } from '../_lib/maxorder';

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
  layout: AnyObj;        // layout config
  themeOverrides?: AnyObj; // colours staff set in /admin; the public site applies only these
  source?: 'live' | 'cached' | 'unavailable';
  error?: string;
}

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
  const data = await fetchMaxorder({ revalidate: 1800 });
  return {
    client: pickClientStatic(data),
    categories: pickCategories(data),
  };
}
const getCachedStatic = unstable_cache(fetchStatic, ['bootstrap-static-v1'], {
  revalidate: 1800,
});

const getCachedLayoutHome = unstable_cache(
  async () => readCurrentLayout('home'),
  ['layout-home-v1'],
  // Saving or restoring in /admin calls revalidateTag(SITE_LAYOUT_TAG), so changes show at once.
  { revalidate: 60, tags: [SITE_LAYOUT_TAG] }
);

/** Owner settings live in our database, so they apply even when the POS is down. */
async function readOwnerSettings() {
  const [overridesResult, layoutResult] = await Promise.allSettled([
    readThemeOverrides(),
    getCachedLayoutHome(),
  ]);
  return {
    overrides: overridesResult.status === 'fulfilled' ? overridesResult.value : {},
    layout: layoutResult.status === 'fulfilled' ? layoutResult.value.layout : DEFAULT_LAYOUTS.home,
  };
}

// ---- DYNAMIC (no-store) fetch: always fresh ----
async function fetchDynamic(): Promise<{ clientFlags: Partial<AnyObj>; menuItems: AnyObj[] }> {
  const data = await fetchMaxorder();

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
  const unavailableClient = { openStatus: false, onlineStatus: false, kioskStatus: false };
  // The POS being down must not undo the owner's layout or colours.
  const unavailable = async (): Promise<NextResponse> => {
    const owner = await readOwnerSettings();
    const body: CombinedOut = {
      client: unavailableClient,
      menuItems: [],
      categories: [],
      layout: owner.layout,
      themeOverrides: owner.overrides,
      source: 'unavailable',
      error: 'Live menu is temporarily unavailable.',
    };
    return NextResponse.json(body, { status: 503 });
  };
  if (!isMaxorderConfigured()) {
    return unavailable();
  }

  // Keep successful static content when the live POS request fails, without
  // a second upstream request or stale claims that ordering is available.
  const [staticResult, dynamicResult, owner] = await Promise.all([
    getCachedStatic().then(
      (value) => ({ status: 'fulfilled' as const, value }),
      () => ({ status: 'rejected' as const }),
    ),
    fetchDynamic().then(
      (value) => ({ status: 'fulfilled' as const, value }),
      () => ({ status: 'rejected' as const }),
    ),
    readOwnerSettings(),
  ]);
  if (staticResult.status === 'rejected') {
    return unavailable();
  }

  const stat = staticResult.value;
  const dyn = dynamicResult.status === 'fulfilled' ? dynamicResult.value : null;
  const client = { ...stat.client, ...(dyn?.clientFlags ?? unavailableClient) };
  const overrides = owner.overrides;
  const payload: CombinedOut = {
    client: { ...client, ...mergeTheme(extractTheme(client), overrides) },
    categories: stat.categories,
    menuItems: dyn?.menuItems ?? [],
    layout: owner.layout,
    themeOverrides: overrides,
    source: dyn ? 'live' : 'cached',
    ...(!dyn ? { error: 'Live menu is temporarily unavailable.' } : {}),
  };
  return NextResponse.json(payload);
}
