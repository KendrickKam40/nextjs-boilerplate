// app/api/client/route.ts
import { NextResponse } from 'next/server';

// extract to avoid duplication
async function proxyClient() {
  const res = await fetch(
    'https://australia-southeast1-maxordering.cloudfunctions.net/thirdpartyaccess/getClientAndMenu',
    {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-api-key': process.env.MAXORDER_API_KEY!
      },
      body: JSON.stringify({ clientId: process.env.MAXORDER_CLIENT_ID! }),
    }
  );
  if (!res.ok) throw new Error('Upstream error ' + res.status);
  const { client } = await res.json();
  console.log('client', client);  
  return client;
}

export async function GET() {
  try {
    const client = await proxyClient();
    return NextResponse.json(client);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST() {
  return GET();  // or call proxyClient() directly
}
