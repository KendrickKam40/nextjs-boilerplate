// app/api/menu/route.ts
import { NextResponse } from 'next/server';

async function proxyMenuItems() {
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

export async function GET() {
  try {
    const menuItems = await proxyMenuItems();
    // wrap in object so front-end can do: const { menuItems } = await res.json();
    return NextResponse.json({ menuItems });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}

export async function POST() {
  return GET();
}
