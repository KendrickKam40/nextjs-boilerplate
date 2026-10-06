const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { test } = require('node:test');
const ts = require('typescript');

// Use the project's TypeScript compiler without adding a separate test runtime.
require.extensions['.ts'] = (module, filename) => {
  const { outputText } = ts.transpileModule(readFileSync(filename, 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
  });
  module._compile(outputText, filename);
};

process.env.ADMIN_SECRET = 'test-only-admin-signing-secret';
const { createSessionToken, verifySessionToken } = require('../lib/auth.ts');
const { fetchMaxorder } = require('../app/api/_lib/maxorder.ts');
const { middleware } = require('../middleware.ts');
const { NextRequest } = require('next/server');

test('admin sessions accept signed tokens and reject tampering and expiration', () => {
  const token = createSessionToken();
  assert.equal(verifySessionToken(token)?.sub, 'admin');
  const [header, payload, signature] = token.split('.');
  const modifiedPayload = Buffer.from(JSON.stringify({ sub: 'admin', exp: 9e9, jti: 'forged' })).toString('base64url');
  assert.equal(verifySessionToken(`${header}.${modifiedPayload}.${signature}`), null);
  assert.equal(verifySessionToken(`${header}.${payload}.short`), null);
  assert.equal(verifySessionToken(createSessionToken(-1)), null);
  assert.equal(verifySessionToken(undefined), null);
});

test('malformed session cookies never throw', () => {
  for (const token of ['', '.', 'a.b.c', 'a.b.', 'a.b.%', 'a.b.' + 'x'.repeat(200)]) {
    assert.equal(verifySessionToken(token), null);
  }
});

test('admin middleware protects pages and APIs and tolerates corrupt cookies', async () => {
  const page = await middleware(new NextRequest('http://localhost/admin'));
  assert.equal(page.status, 307);
  assert.equal(new URL(page.headers.get('location')).pathname, '/admin/login');

  const api = await middleware(new NextRequest('http://localhost/api/admin/video', {
    headers: { cookie: 'admin_session=a.b.%%%' },
  }));
  assert.equal(api.status, 401);

  const authorized = await middleware(new NextRequest('http://localhost/api/admin/video', {
    headers: { cookie: `admin_session=${createSessionToken()}` },
  }));
  assert.equal(authorized.status, 200);
  assert.equal(authorized.headers.get('x-middleware-next'), '1');
});

test('database modules can be imported before database configuration exists', () => {
  const previousPostgres = process.env.POSTGRES_URL;
  const previousDatabase = process.env.DATABASE_URL;
  delete process.env.POSTGRES_URL;
  delete process.env.DATABASE_URL;
  try {
    const { sql } = require('../lib/db.ts');
    assert.equal(typeof sql, 'function');
    assert.throws(() => sql`SELECT 1`, /Database is not configured/);
  } finally {
    restoreEnv('POSTGRES_URL', previousPostgres);
    restoreEnv('DATABASE_URL', previousDatabase);
  }
});

test('loyalty route imports without Firebase and reports missing credentials safely', async () => {
  const previous = process.env.FIREBASE_SERVICE_ACCOUNT;
  delete process.env.FIREBASE_SERVICE_ACCOUNT;
  try {
    const { GET } = require('../app/api/points/route.ts');
    const anonymous = await GET(new NextRequest('http://localhost/api/points'));
    assert.equal(anonymous.status, 401);
    const unavailable = await GET(new NextRequest('http://localhost/api/points', {
      headers: { authorization: 'Bearer test-token' },
    }));
    assert.equal(unavailable.status, 503);
  } finally {
    restoreEnv('FIREBASE_SERVICE_ACCOUNT', previous);
  }
});

function restoreEnv(key, value) {
  if (value === undefined) delete process.env[key];
  else process.env[key] = value;
}

test('missing POS credentials fail locally without making an upstream request', async (t) => {
  const previousKey = process.env.MAXORDER_API_KEY;
  delete process.env.MAXORDER_API_KEY;
  const fetch = t.mock.method(globalThis, 'fetch', async () => {
    throw new Error('Unexpected upstream request');
  });
  try {
    await assert.rejects(fetchMaxorder(), /Online menu is not configured/);
    assert.equal(fetch.mock.callCount(), 0);
  } finally {
    restoreEnv('MAXORDER_API_KEY', previousKey);
  }
});

test('POS requests respect the configured endpoint and reject invalid payloads', async (t) => {
  const keys = ['MAXORDER_API_KEY', 'MAXORDER_CLIENT_ID', 'MAXORDER_UPSTREAM'];
  const previous = keys.map((key) => process.env[key]);
  process.env.MAXORDER_API_KEY = 'test-only-key';
  process.env.MAXORDER_CLIENT_ID = 'test-client';
  process.env.MAXORDER_UPSTREAM = 'https://example.invalid/menu';
  const fetch = t.mock.method(globalThis, 'fetch', async () => new Response('[]', { status: 200 }));
  try {
    await assert.rejects(fetchMaxorder(), /invalid response/);
    const [url, options] = fetch.mock.calls[0].arguments;
    assert.equal(url, 'https://example.invalid/menu');
    assert.equal(options.headers['x-api-key'], 'test-only-key');
    assert.equal(options.cache, 'no-store');
    assert.equal(JSON.parse(options.body).clientId, 'test-client');
    assert.ok(options.signal instanceof AbortSignal);
  } finally {
    keys.forEach((key, index) => restoreEnv(key, previous[index]));
  }
});

test('YouTube links staff can save are links the store screen can play', () => {
  const { parseYouTubeLink, youTubeId } = require('../lib/youtube.ts');
  const id = 'dQw4w9WgXcQ';
  for (const url of [
    `https://www.youtube.com/watch?v=${id}`,
    `https://youtube.com/watch?v=${id}&list=PL123&t=30`,
    `https://m.youtube.com/watch?v=${id}`,
    `https://youtu.be/${id}?si=abc`,
    `https://youtu.be/${id}/`,
    `https://www.youtube.com/shorts/${id}`,
    `https://www.youtube.com/live/${id}`,
    `https://www.youtube.com/embed/${id}`,
    `https://www.youtube-nocookie.com/embed/${id}`,
    `youtube.com/watch?v=${id}`,
  ]) {
    assert.equal(youTubeId(url), id, url);
  }
  for (const url of [
    '',
    'not a link',
    'https://vimeo.com/123456',
    'https://www.youtube.com/playlist?list=PL123',
    'https://www.youtube.com/watch?v=short',
    'https://evil-youtube.com/watch?v=dQw4w9WgXcQ',
    'https://www.youtube.com/@balibu',
  ]) {
    const link = parseYouTubeLink(url);
    assert.equal(link.ok, false, url);
    assert.match(link.reason, /\S/);
  }
  assert.match(parseYouTubeLink('https://www.youtube.com/playlist?list=PL123').reason, /Playlist links/);
});

test('owner colours apply only when they stay readable, and say why when not', () => {
  const { normalizeHex, resolveTheme, THEME_BASE } = require('../lib/site-theme.ts');
  assert.equal(normalizeHex('#FFF'), '#ffffff');
  assert.equal(normalizeHex('abc'), '#aabbcc');
  assert.equal(normalizeHex(' #2A6F3E '), '#2a6f3e');
  assert.equal(normalizeHex('0xff0000'), '#ff0000');
  assert.equal(normalizeHex('#12345'), undefined);

  const base = resolveTheme({});
  assert.deepEqual(base.vars, {});
  assert.equal(base.checks.primaryColor.value, THEME_BASE.primaryColor);

  const custom = resolveTheme({ primaryColor: '#1d4ed8' });
  assert.equal(custom.checks.primaryColor.applied, true);
  assert.equal(custom.vars['--b-accent'], '#1d4ed8');
  assert.ok(custom.vars['--b-on-accent']);

  const unreadable = resolveTheme({ secondaryColor: '#9a731e', backgroundColor: '#222222' });
  assert.equal(unreadable.checks.secondaryColor.applied, false);
  assert.match(unreadable.checks.secondaryColor.problem, /lighter shade/);
  assert.equal(unreadable.checks.backgroundColor.applied, false);
  assert.equal(unreadable.vars['--b-gold'], undefined);
  assert.equal(unreadable.vars['--b-paper'], undefined);
});
