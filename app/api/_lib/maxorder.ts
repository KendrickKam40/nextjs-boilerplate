const DEFAULT_UPSTREAM =
  'https://australia-southeast1-maxordering.cloudfunctions.net/thirdpartyaccess/getClientAndMenu';

export function isMaxorderConfigured() {
  return Boolean(process.env.MAXORDER_API_KEY && process.env.MAXORDER_CLIENT_ID);
}

export async function fetchMaxorder(
  options: { endpoint?: string; revalidate?: number } = {}
): Promise<Record<string, any>> {
  if (!isMaxorderConfigured()) {
    throw new Error('Online menu is not configured');
  }

  const response = await fetch(
    options.endpoint || process.env.MAXORDER_UPSTREAM || DEFAULT_UPSTREAM,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.MAXORDER_API_KEY!,
      },
      body: JSON.stringify({ clientId: process.env.MAXORDER_CLIENT_ID }),
      signal: AbortSignal.timeout(8_000),
      ...(options.revalidate
        ? { next: { revalidate: options.revalidate } }
        : { cache: 'no-store' as const }),
    }
  );

  if (!response.ok) throw new Error('Online menu is temporarily unavailable');
  const data: unknown = await response.json();
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('Online menu returned an invalid response');
  }
  return data as Record<string, any>;
}
