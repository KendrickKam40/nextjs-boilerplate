import crypto from 'crypto';
import { sql } from '@/lib/db';
import { DEFAULT_LAYOUTS, normalizeLayout, type LayoutConfig, type PageKey } from '@/lib/layout-config';

type LayoutVersionRow = {
  id: string;
  layout: any;
  created_at: string;
  created_by: string | null;
};

export async function readCurrentLayout(pageKey: PageKey): Promise<{ versionId: string | null; layout: LayoutConfig }> {
  const rows = (await sql`
    SELECT v.id, v.layout
    FROM site_layout_current c
    JOIN site_layout_versions v ON v.id = c.version_id
    WHERE c.page_key = ${pageKey}
    LIMIT 1
  `) as { id: string; layout: any }[];

  if (rows.length === 0) {
    return { versionId: null, layout: DEFAULT_LAYOUTS[pageKey] };
  }

  return {
    versionId: rows[0].id,
    layout: normalizeLayout(rows[0].layout, pageKey),
  };
}

export async function listLayoutHistory(pageKey: PageKey): Promise<LayoutVersionRow[]> {
  const rows = (await sql`
    SELECT id, layout, created_at, created_by
    FROM site_layout_versions
    WHERE page_key = ${pageKey}
    ORDER BY created_at DESC
  `) as LayoutVersionRow[];

  return rows.map((row) => ({
    ...row,
    layout: normalizeLayout(row.layout, pageKey),
  }));
}

export async function saveLayoutVersion(
  pageKey: PageKey,
  layoutInput: any,
  createdBy: string | null = null
): Promise<{ versionId: string; layout: LayoutConfig }> {
  const layout = normalizeLayout(layoutInput, pageKey);
  const versionId = crypto.randomUUID();
  const payload = JSON.stringify(layout);

  await sql.transaction([
    sql`
      INSERT INTO site_layout_versions (id, page_key, layout, created_by)
      VALUES (${versionId}::uuid, ${pageKey}, ${payload}::jsonb, ${createdBy})
    `,
    sql`
      INSERT INTO site_layout_current (page_key, version_id)
      VALUES (${pageKey}, ${versionId}::uuid)
      ON CONFLICT (page_key)
      DO UPDATE SET version_id = EXCLUDED.version_id, updated_at = now()
    `,
  ]);

  return { versionId, layout };
}

export async function restoreLayoutVersion(
  pageKey: PageKey,
  versionId: string
): Promise<{ versionId: string; layout: LayoutConfig } | null> {
  const rows = (await sql`
    SELECT id, layout
    FROM site_layout_versions
    WHERE id = ${versionId}::uuid AND page_key = ${pageKey}
    LIMIT 1
  `) as { id: string; layout: any }[];

  if (rows.length === 0) return null;

  await sql`
    INSERT INTO site_layout_current (page_key, version_id)
    VALUES (${pageKey}, ${versionId}::uuid)
    ON CONFLICT (page_key)
    DO UPDATE SET version_id = EXCLUDED.version_id, updated_at = now()
  `;

  return { versionId: rows[0].id, layout: normalizeLayout(rows[0].layout, pageKey) };
}
