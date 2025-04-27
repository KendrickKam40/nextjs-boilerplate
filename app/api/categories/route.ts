// app/api/categories/route.ts
import { NextResponse } from 'next/server';

async function proxyCategories() {
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
  if (!Array.isArray(data.categories)) {
    throw new Error('Invalid payload: categories missing');
  }

  return data.categories;
}

export async function GET() {
  try {
    const categories = await proxyCategories();
    // wrap in object so front-end can do `const { categories } = await res.json()`
    return NextResponse.json({ categories });
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
