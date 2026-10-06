export const SIGNED_OUT_EVENT = 'balibu-admin:signed-out';
export const SIGNED_IN_EVENT = 'balibu-admin:signed-in';

export type AdminResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; message: string; data: Record<string, any> };

/** Fetch for admin APIs: staff-readable errors, and a shell-wide signed-out signal on 401. */
export async function adminRequest<T>(url: string, init?: RequestInit): Promise<AdminResult<T>> {
  let response: Response;
  try {
    response = await fetch(url, {
      cache: 'no-store',
      ...init,
      headers: init?.body ? { 'Content-Type': 'application/json', ...init.headers } : init?.headers,
    });
  } catch {
    return {
      ok: false,
      status: 0,
      message: 'Couldn’t reach the website. Check the internet connection and try again.',
      data: {},
    };
  }
  const data = await response.json().catch(() => ({}));
  if (response.ok) {
    window.dispatchEvent(new Event(SIGNED_IN_EVENT));
    return { ok: true, data: data as T };
  }
  const reading = !init?.method || init.method === 'GET';
  if (response.status === 401) {
    window.dispatchEvent(new Event(SIGNED_OUT_EVENT));
    if (reading) {
      return {
        ok: false,
        status: 401,
        message: 'You’re signed out. Sign in again in a new tab, then press Try again.',
        data,
      };
    }
  }
  return {
    ok: false,
    status: response.status,
    message: typeof data?.error === 'string' ? data.error : 'Something went wrong. Try again.',
    data,
  };
}
