import crypto from 'crypto';

const ADMIN_SECRET = process.env.ADMIN_SECRET || '';

export type SessionPayload = {
  sub: 'admin';
  exp: number;
  jti: string;
};

const COOKIE_NAME = 'admin_session';

export const getAdminCookieName = () => COOKIE_NAME;

export function requireSecrets() {
  if (!ADMIN_SECRET) {
    throw new Error('ADMIN_SECRET is not set');
  }
}

function base64url(input: Buffer) {
  return input
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function sign(payload: SessionPayload) {
  requireSecrets();
  const header = base64url(Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })));
  const body = base64url(Buffer.from(JSON.stringify(payload)));
  const data = `${header}.${body}`;
  const sig = crypto
    .createHmac('sha256', ADMIN_SECRET)
    .update(data)
    .digest();
  return `${data}.${base64url(sig)}`;
}

function verify(token: string): SessionPayload | null {
  requireSecrets();
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [headerB64, bodyB64, sigB64] = parts;
  const data = `${headerB64}.${bodyB64}`;
  const expected = base64url(
    crypto.createHmac('sha256', ADMIN_SECRET).update(data).digest()
  );
  if (!crypto.timingSafeEqual(Buffer.from(sigB64), Buffer.from(expected))) return null;

  try {
    const payload = JSON.parse(Buffer.from(bodyB64, 'base64').toString('utf8')) as SessionPayload;
    if (payload.sub !== 'admin') return null;
    if (typeof payload.exp !== 'number' || Date.now() / 1000 > payload.exp) return null;
    if (typeof payload.jti !== 'string') return null;
    return payload;
  } catch {
    return null;
  }
}

export function createSessionToken(ttlSeconds = 7200) {
  const payload: SessionPayload = {
    sub: 'admin',
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
    jti: crypto.randomUUID(),
  };
  return sign(payload);
}

export function verifySessionToken(token: string | undefined | null) {
  if (!token) return null;
  return verify(token);
}
