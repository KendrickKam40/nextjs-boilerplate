import fs from 'fs/promises';
import path from 'path';

const DEFAULT_PATH = process.env.DATA_FILE || path.join(process.cwd(), 'data', 'admin-config.json');

type AdminConfig = {
  videoUrls?: string[];
};

async function ensureDir(filePath: string) {
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
}

export async function readAdminConfig(): Promise<AdminConfig> {
  const filePath = DEFAULT_PATH;
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    return parsed || {};
  } catch (err: any) {
    // File not found -> return empty config
    if (err.code === 'ENOENT') return {};
    throw err;
  }
}

export async function writeAdminConfig(config: AdminConfig) {
  const filePath = DEFAULT_PATH;
  await ensureDir(filePath);
  const content = JSON.stringify(config, null, 2);
  await fs.writeFile(filePath, content, 'utf8');
}

export function getVideoUrlsFromConfig(config: AdminConfig): string[] {
  const list = config.videoUrls;
  if (!Array.isArray(list)) return [];
  return list.map((v) => (v || '').toString().trim()).filter(Boolean);
}
