import type { CSSProperties } from 'react';

// Base palette from DESIGN.md. Owner overrides from /admin replace these
// only when they keep text readable; otherwise the base value stays.
export const THEME_BASE = {
  backgroundColor: '#fff3df',
  textColor: '#1d5a35',
  headingPrimaryColor: '#1d5a35',
  primaryColor: '#bd2f1b',
  secondaryColor: '#f6c445',
} as const;

export type EditableThemeKey = keyof typeof THEME_BASE;

const ON_ACCENT = '#fff3df';
const DARK = '#191a17';

/** What each colour does on the site, in the words staff see in /admin. */
export const THEME_FIELDS: {
  key: EditableThemeKey;
  label: string;
  description: string;
}[] = [
  {
    key: 'backgroundColor',
    label: 'Page background',
    description: 'The cream behind the story section and the colour of most big lettering. Keep it light.',
  },
  {
    key: 'textColor',
    label: 'Text and dark panels',
    description: 'The green menu section and footer, and body text on light backgrounds.',
  },
  {
    key: 'headingPrimaryColor',
    label: 'Big headings',
    description: 'Headings on light backgrounds.',
  },
  {
    key: 'primaryColor',
    label: 'Accent',
    description: 'The red hero slide, Visit section, top bar and big “NASI GORENG” lettering.',
  },
  {
    key: 'secondaryColor',
    label: 'Highlight',
    description: 'The yellow Something sweet section, the ticker bands and the third hero slide.',
  },
];

export function normalizeHex(value?: string) {
  if (!value) return undefined;
  let raw = value.trim();
  // Accept the short form staff often copy, e.g. #fff.
  if (/^#?[\da-f]{3}$/i.test(raw)) raw = raw.replace(/^#?(.)(.)(.)$/, '#$1$1$2$2$3$3');
  const normalized = raw.startsWith('0x')
    ? `#${raw.slice(-6)}`
    : raw.startsWith('#')
      ? raw
      : `#${raw}`;
  return /^#[\da-f]{6}$/i.test(normalized) ? normalized.toLowerCase() : undefined;
}

function luminance(color: string) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(color.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a: string, b: string) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

function best(background: string, candidates: string[]) {
  return candidates.reduce((winner, color) =>
    contrast(color, background) > contrast(winner, background) ? color : winner,
  );
}

export interface ThemeCheck {
  value: string;
  custom: boolean;
  applied: boolean;
  /** Present when a custom colour is ignored for being hard to read. */
  problem?: string;
}

/** Resolves overrides the way the public site does, explaining any rejection. */
export function resolveTheme(overrides?: Partial<Record<string, string>>) {
  const checks = {} as Record<EditableThemeKey, ThemeCheck>;
  const pick = (
    key: EditableThemeKey,
    fallback: string,
    test?: (color: string) => { against: string; againstColor: string } | null,
  ) => {
    const custom = normalizeHex(overrides?.[key]);
    if (!custom) {
      checks[key] = { value: fallback, custom: false, applied: true };
      return fallback;
    }
    const failure = test?.(custom);
    if (failure) {
      checks[key] = {
        value: custom,
        custom: true,
        applied: false,
        problem: `Too hard to read against ${failure.against}, so the website keeps the Balibu colour. Try a ${
          luminance(custom) >= luminance(failure.againstColor) ? 'lighter' : 'darker'
        } shade.`,
      };
      return fallback;
    }
    checks[key] = { value: custom, custom: true, applied: true };
    return custom;
  };
  // Minimum contrast each role needs against what it sits on or carries.
  const need = (color: string, againstColor: string, needed: number, against: string) =>
    contrast(color, againstColor) < needed ? { against, againstColor } : null;

  const paper = pick('backgroundColor', THEME_BASE.backgroundColor, (c) =>
    need(c, DARK, 10, 'dark text'),
  );
  const inkFallback = contrast(THEME_BASE.textColor, paper) >= 7 ? THEME_BASE.textColor : DARK;
  const ink = pick('textColor', inkFallback, (c) => need(c, paper, 7, 'the page background'));
  const heading = pick('headingPrimaryColor', ink, (c) => need(c, paper, 4.5, 'the page background'));
  const accent = pick('primaryColor', THEME_BASE.primaryColor, (c) =>
    need(c, paper, 3, 'the page background'),
  );
  const highlight = pick('secondaryColor', THEME_BASE.secondaryColor, (c) =>
    need(c, ink, 4.5, 'the dark panels'),
  );

  const vars: Record<string, string> = {};
  if (paper !== THEME_BASE.backgroundColor) vars['--b-paper'] = paper;
  if (ink !== THEME_BASE.textColor) vars['--b-ink'] = ink;
  if (checks.headingPrimaryColor.custom && checks.headingPrimaryColor.applied) vars['--b-heading'] = heading;
  if (accent !== THEME_BASE.primaryColor) {
    vars['--b-accent'] = accent;
    vars['--b-on-accent'] = best(accent, [ON_ACCENT, '#ffffff', DARK]);
  }
  if (highlight !== THEME_BASE.secondaryColor) vars['--b-gold'] = highlight;

  return { checks, vars: vars as CSSProperties };
}

/** CSS variables for the restaurant surface from owner theme overrides. */
export function themeVariables(overrides?: Partial<Record<string, string>>) {
  return resolveTheme(overrides).vars;
}
