import { sql } from '@/lib/db';

export const THEME_KEYS = [
  'primaryColor',
  'secondaryColor',
  'headingPrimaryColor',
  'headingSecondaryColor',
  'textColor',
  'coverTextColor',
  'backgroundColor',
] as const;

export type ThemeKey = (typeof THEME_KEYS)[number];
export type ThemeValues = Record<ThemeKey, string>;
export type ThemeOverrides = Partial<ThemeValues>;

export const normalizeHexColor = (value?: string) => {
  if (!value) return '';
  const raw = String(value).trim();
  if (!raw) return '';
  if (raw.startsWith('0x') && raw.length >= 8) return `#${raw.slice(-6)}`;
  if (/^#[0-9a-fA-F]{6}$/.test(raw)) return raw;
  if (/^[0-9a-fA-F]{6}$/.test(raw)) return `#${raw}`;
  return '';
};

export const emptyTheme = (): ThemeValues => ({
  primaryColor: '',
  secondaryColor: '',
  headingPrimaryColor: '',
  headingSecondaryColor: '',
  textColor: '',
  coverTextColor: '',
  backgroundColor: '',
});

export const extractTheme = (client: Record<string, any>): ThemeValues => {
  const primaryColor = normalizeHexColor(client?.primaryColor);
  const secondaryColor = normalizeHexColor(client?.secondaryColor);
  const textColor = normalizeHexColor(client?.textColor);
  const headingPrimaryColor =
    normalizeHexColor(client?.headingPrimaryColor) || primaryColor || textColor;
  const headingSecondaryColor =
    normalizeHexColor(client?.headingSecondaryColor) || secondaryColor || textColor;
  const coverTextColor = normalizeHexColor(client?.coverTextColor);
  const backgroundColor = normalizeHexColor(client?.backgroundColor || client?.bgColor);

  return {
    primaryColor,
    secondaryColor,
    headingPrimaryColor,
    headingSecondaryColor,
    textColor,
    coverTextColor,
    backgroundColor,
  };
};

export const sanitizeThemeOverrides = (input: Record<string, any>): ThemeOverrides => {
  const overrides: ThemeOverrides = {};
  for (const key of THEME_KEYS) {
    const normalized = normalizeHexColor(input?.[key]);
    if (normalized) overrides[key] = normalized;
  }
  return overrides;
};

export const mergeTheme = (posTheme: ThemeValues, overrides: ThemeOverrides): ThemeValues => ({
  primaryColor: overrides.primaryColor || posTheme.primaryColor,
  secondaryColor: overrides.secondaryColor || posTheme.secondaryColor,
  headingPrimaryColor: overrides.headingPrimaryColor || posTheme.headingPrimaryColor,
  headingSecondaryColor: overrides.headingSecondaryColor || posTheme.headingSecondaryColor,
  textColor: overrides.textColor || posTheme.textColor,
  coverTextColor: overrides.coverTextColor || posTheme.coverTextColor,
  backgroundColor: overrides.backgroundColor || posTheme.backgroundColor,
});

export async function readThemeOverrides(): Promise<ThemeOverrides> {
  const rows = (await sql`
    SELECT overrides
    FROM site_theme_settings
    WHERE id = 1
  `) as { overrides: any }[];
  const overrides = rows[0]?.overrides ?? {};
  return sanitizeThemeOverrides(overrides);
}

export async function writeThemeOverrides(overrides: ThemeOverrides): Promise<ThemeOverrides> {
  const sanitized = sanitizeThemeOverrides(overrides || {});
  const payload = JSON.stringify(sanitized);
  await sql`
    INSERT INTO site_theme_settings (id, overrides)
    VALUES (1, ${payload}::jsonb)
    ON CONFLICT (id)
    DO UPDATE SET overrides = EXCLUDED.overrides, updated_at = now()
  `;
  return sanitized;
}
