// app/api/menu/route.ts
import { NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import { fetchMaxorder } from '../_lib/maxorder';

async function proxyMenuItems(): Promise<any[]> {
  const data = await fetchMaxorder();
  const items = data.menuItems ?? data.menu?.menuItems ?? data.items;
  if (!Array.isArray(items)) {
    throw new Error('Invalid payload: menuItems missing');
  }
  return items;
}

// Persist menu items in the Data Cache for 10 minutes (adjust as needed)
const getMenuItemsCached = unstable_cache(
  proxyMenuItems,
  ['maxordering-menu-items'],
  { revalidate: 600 } // revalidate after 600 seconds
);

export async function GET() {
  try {
    const menuItems = await getMenuItemsCached();
    return NextResponse.json({ menuItems });
  } catch {
    return NextResponse.json(
      { menuItems: [], error: 'Live menu is temporarily unavailable.' },
      { status: 503 }
    );
  }
}

export async function POST() {
  // Delegate POST to GET since both should return the same data
  return GET();
}
