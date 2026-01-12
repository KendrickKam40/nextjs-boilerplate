export const PAGE_KEYS = ['home'] as const;
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

export const LAYOUT_SECTIONS: Record<PageKey, LayoutSection[]> = {
  home: [
    { id: 'ticker', label: 'Ticker', description: 'Scrolling announcement banner.' },
    { id: 'story', label: 'Our Story', description: 'Brand story with image.' },
    { id: 'seasonal', label: 'Seasonal Offers', description: 'Showcase specials section.' },
    { id: 'categories', label: 'Categories', description: 'Category carousel.' },
    { id: 'contact', label: 'Contact', description: 'Contact details and map.' },
  ],
};

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
