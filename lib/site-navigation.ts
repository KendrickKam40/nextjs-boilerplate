import type { LayoutSectionId } from './layout-config';

export type ChapterId = 'menu' | 'story' | 'flavours' | 'visit';

export const CHAPTERS = {
  menu: {
    label: 'The menu',
    short: 'The menu',
    hash: '#menu',
    section: 'categories',
  },
  story: {
    label: 'About Balibu',
    short: 'About Balibu',
    hash: '#about',
    section: 'story',
  },
  flavours: {
    label: 'Featured dishes',
    short: 'Featured dishes',
    hash: '#flavours',
    section: 'seasonal',
  },
  visit: {
    label: 'Visit us',
    short: 'Visit us',
    hash: '#contact',
    section: 'contact',
  },
} as const satisfies Record<
  ChapterId,
  {
    label: string;
    short: string;
    hash: string;
    section: LayoutSectionId;
  }
>;

export function chapterFromHash(hash: string): ChapterId | null {
  return (
    (Object.keys(CHAPTERS) as ChapterId[]).find(
      (id) => CHAPTERS[id].hash === hash,
    ) ?? null
  );
}
