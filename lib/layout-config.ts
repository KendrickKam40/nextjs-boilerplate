export const PAGE_KEYS = ['home'] as const;

/** Cache tag for the published homepage layout (see app/api/client/route.ts). */
export const SITE_LAYOUT_TAG = 'site-layout';
export type PageKey = (typeof PAGE_KEYS)[number];

export type LayoutSectionId =
  | 'ticker'
  | 'story'
  | 'seasonal'
  | 'categories'
  | 'contact';

export type LayoutItem = {
  id: LayoutSectionId;
  enabled: boolean;
};

export type LayoutConfig = {
  items: LayoutItem[];
};

export type LayoutSection = {
  id: LayoutSectionId;
  label: string;
  description: string;
};

// Labels match the homepage card titles staff see on the website (lib/site-navigation.ts).
export const LAYOUT_SECTIONS: Record<PageKey, LayoutSection[]> = {
  home: [
    {
      id: 'ticker',
      label: 'Announcement',
      description: 'Shows the kiosk message from the POS in a strip at the top of the homepage.',
    },
    {
      id: 'categories',
      label: 'The menu',
      description: 'Menu sections, with live items and prices from the POS.',
    },
    {
      id: 'story',
      label: 'About Balibu',
      description: 'Balibu’s story beside the photo of the counter.',
    },
    {
      id: 'seasonal',
      label: 'Something sweet',
      description: 'Milkshakes, smoothies, slushies and sundaes, with live sweet prices from the POS.',
    },
    {
      id: 'contact',
      label: 'Visit us',
      description: 'Address, opening hours and directions.',
    },
  ],
};

export const ANNOUNCEMENT_SECTION: LayoutSectionId = 'ticker';

export const DEFAULT_LAYOUTS: Record<PageKey, LayoutConfig> = {
  home: {
    items: LAYOUT_SECTIONS.home.map((section) => ({
      id: section.id,
      enabled: true,
    })),
  },
};

export function isPageKey(value: string): value is PageKey {
  return (PAGE_KEYS as readonly string[]).includes(value);
}

export function normalizeLayout(input: any, pageKey: PageKey): LayoutConfig {
  const available = new Set(LAYOUT_SECTIONS[pageKey].map((s) => s.id));
  const rawItems = Array.isArray(input?.items) ? input.items : Array.isArray(input) ? input : [];
  const seen = new Set<LayoutSectionId>();
  const items: LayoutItem[] = [];

  for (const raw of rawItems) {
    const id = raw?.id as LayoutSectionId;
    if (!id || !available.has(id)) continue;
    if (seen.has(id)) continue;
    items.push({ id, enabled: raw?.enabled !== false });
    seen.add(id);
  }

  return { items };
}
