// app/api/client/route.ts
import { NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';

type AnyObj = Record<string, any>;
interface BootstrapResponse {
  client: AnyObj;
  menuItems: AnyObj[];
  categories: AnyObj[];
}

async function fetchCombined(): Promise<BootstrapResponse> {
  // Reuse your current upstream endpoint + headers/body here
  const res = await fetch(process.env.MAXORDER_UPSTREAM!, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.MAXORDER_API_KEY!,
    },
    body: JSON.stringify({ clientId: process.env.MAXORDER_CLIENT_ID! }),
    next: { revalidate: 5 }, // cache hint
  });
  if (!res.ok) throw new Error(`Upstream error ${res.status}`);

  const data = (await res.json()) as AnyObj;

  // Normalize possible shapes
  const client = data.client ?? data ?? {};
  const menuItems = Array.isArray(data.menuItems)
    ? data.menuItems
    : Array.isArray(data.menu?.menuItems)
    ? data.menu.menuItems
    : Array.isArray(data.items)
    ? data.items
    : [];
  const categories = Array.isArray(data.categories)
    ? data.categories
    : Array.isArray(data.menu?.categories)
    ? data.menu.categories
    : [];

  return { client, menuItems, categories };
}

const getCachedCombined = unstable_cache(fetchCombined, ['bootstrap-combined'], {
  revalidate: 5, // 5 second
});

export async function GET() {
  try {
    const payload = await getCachedCombined();
    return NextResponse.json(payload);
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Internal Error' }, { status: 500 });
  }
}