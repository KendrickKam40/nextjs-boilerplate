// app/api/client/route.ts
import next from 'next';
import { NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';

// This function still performs the POST request to the third‑party API.
async function proxyClient(): Promise<any> {
  const res = await fetch(
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
  if (!res.ok) throw new Error('Upstream error ' + res.status);
  const { client } = await res.json();
  return client;
}

// Wrap the function in unstable_cache with a key and revalidation period (e.g. 10 minutes)
const getCachedClient = unstable_cache(
  proxyClient,
  ['maxordering-client'],
  { revalidate: 3600 } // seconds; adjust to your needs
);

export async function GET() {
  try {
    const client = await getCachedClient();
    return NextResponse.json(client);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST() {
  // If both GET and POST should return the same data, reuse the cached call
  return GET();
}
