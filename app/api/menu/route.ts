// app/api/menu/route.ts
import { NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';

async function proxyMenuItems(): Promise<any[]> {
  const upstream = await fetch(
    'https://australia-southeast1-maxordering.cloudfunctions.net/thirdpartyaccess/getClientAndMenu',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.MAXORDER_API_KEY!,
      },
      body: JSON.stringify({ clientId: process.env.MAXORDER_CLIENT_ID! }),
    }
  );
  if (!upstream.ok) {
    throw new Error('Upstream error ' + upstream.status);
  }
  const data = await upstream.json();
  if (!Array.isArray(data.menuItems)) {
    throw new Error('Invalid payload: menuItems missing');
  }
  return data.menuItems;
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
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}

export async function POST() {
  // Delegate POST to GET since both should return the same data
  return GET();
}