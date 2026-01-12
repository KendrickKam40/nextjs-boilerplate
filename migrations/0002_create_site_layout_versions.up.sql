CREATE TABLE IF NOT EXISTS site_layout_versions (
  id uuid PRIMARY KEY,
  page_key text NOT NULL,
  layout jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by text
);

CREATE TABLE IF NOT EXISTS site_layout_current (
  page_key text PRIMARY KEY,
  version_id uuid NOT NULL REFERENCES site_layout_versions(id),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS site_layout_versions_page_key_idx
  ON site_layout_versions (page_key, created_at DESC);
