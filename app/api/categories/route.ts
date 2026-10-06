// app/api/categories/route.ts
import { NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import { fetchMaxorder } from '../_lib/maxorder';

type Category = {
  name: string;
  visible?: boolean;
  avalibleFrom?: string; // spelling as per API
  avalibleTo?: string;
  days?: string[];
  order?: number;
};

type CategoriesResponse = { categories: Category[] };

async function fetchCategories(): Promise<CategoriesResponse> {
  const data = await fetchMaxorder({ endpoint: process.env.MAXORDER_CATEGORIES_URL });
  const categories = data.categories ?? data.menu?.categories;
  if (!Array.isArray(categories)) {
    throw new Error('Invalid payload: categories missing');
  }
  return { categories };
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
  } catch {
    return NextResponse.json(
      { categories: [], error: 'Menu categories are temporarily unavailable.' },
      { status: 503 }
    );
  }
}
