import fs from 'fs/promises';
import path from 'path';

const DEFAULT_PATH = process.env.DATA_FILE || path.join(process.cwd(), 'data', 'admin-config.json');
const BLOB_ENABLED = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
const BLOB_KEY = 'admin/config.json';

type AdminConfig = {
  videoUrls?: string[];
};

async function ensureDir(filePath: string) {
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
}

async function readFromFile(): Promise<AdminConfig> {
  const filePath = DEFAULT_PATH;
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    return parsed || {};
  } catch (err: any) {
    if (err.code === 'ENOENT') return {};
    throw err;
  }
}

async function writeToFile(config: AdminConfig) {
  const filePath = DEFAULT_PATH;
  await ensureDir(filePath);
  const content = JSON.stringify(config, null, 2);
  await fs.writeFile(filePath, content, 'utf8');
}

async function readFromBlob(): Promise<AdminConfig> {
  const { list } = await import('@vercel/blob');
  const { blobs } = await list({ prefix: BLOB_KEY, limit: 1 });
  const hit = blobs.find((b) => b.pathname === BLOB_KEY);
  if (!hit) return {};
  // Bypass any CDN caching so the latest order is used
  const res = await fetch(hit.url, { cache: 'no-store' });
  if (!res.ok) return {};
  return (await res.json()) as AdminConfig;
}

async function writeToBlob(config: AdminConfig) {
  const { put } = await import('@vercel/blob');
  await put(BLOB_KEY, JSON.stringify(config), {
    // Hobby tier requires public access; path is non-guessable and scoped by token.
    access: 'public',
    addRandomSuffix: false,
    contentType: 'application/json',
  });
}

export async function readAdminConfig(): Promise<AdminConfig> {
  if (BLOB_ENABLED) {
    return readFromBlob();
  }
  return readFromFile();
}

export async function writeAdminConfig(config: AdminConfig) {
  if (BLOB_ENABLED) {
    await writeToBlob(config);
    return;
  }
  await writeToFile(config);
}

export function getVideoUrlsFromConfig(config: AdminConfig): string[] {
  const list = config.videoUrls;
  if (!Array.isArray(list)) return [];
  return list.map((v) => (v || '').toString().trim()).filter(Boolean);
}
