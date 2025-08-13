// app/api/categories/route.ts
import { NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';

type Category = {
  name: string;
  visible?: boolean;
  avalibleFrom?: string; // spelling as per API
  avalibleTo?: string;
  days?: string[];
  order?: number;
};

type CategoriesResponse = { categories: Category[] };

// You can override the endpoint via env if needed.
const CATEGORIES_ENDPOINT =
  process.env.MAXORDER_CATEGORIES_URL ||
  'https://australia-southeast1-maxordering.cloudfunctions.net/thirdpartyaccess/getClientAndMenu';

async function fetchCategories(): Promise<CategoriesResponse> {
  const res = await fetch(CATEGORIES_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.MAXORDER_API_KEY!,
    },
    body: JSON.stringify({ clientId: process.env.MAXORDER_CLIENT_ID! }),
  });
  if (!res.ok) {
    throw new Error(`Categories upstream error ${res.status}`);
  }
  // Expecting { categories: [...] }
  return res.json();
}

// Cache for 10 minutes
const getCachedCategories = unstable_cache(
  fetchCategories,
  ['maxordering-categories'],
  { revalidate: 600 }
);

export async function GET() {
  try {
    const data = await getCachedCategories();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}