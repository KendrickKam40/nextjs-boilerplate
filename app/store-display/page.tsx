import type { Metadata } from 'next';
import StoreDisplay from '@/components/display/StoreDisplay';
import { readDisplayPlaylist } from '@/lib/display';
import { themeVariables } from '@/lib/site-theme';
import { readThemeOverrides } from '@/lib/theme';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Balibu store display',
  robots: { index: false, follow: false },
};

export default async function StoreDisplayPage() {
  const [initial, overrides] = await Promise.all([
    readDisplayPlaylist(),
    // Owner colours from /admin; the Balibu palette if they can't be read.
    readThemeOverrides().catch(() => ({})),
  ]);
  return <StoreDisplay initial={initial} themeStyle={themeVariables(overrides)} />;
}
