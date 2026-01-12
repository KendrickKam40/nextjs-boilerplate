CREATE TABLE IF NOT EXISTS site_theme_settings (
  id int PRIMARY KEY CHECK (id = 1),
  overrides jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO site_theme_settings (id, overrides)
VALUES (1, '{}'::jsonb)
ON CONFLICT (id) DO NOTHING;
