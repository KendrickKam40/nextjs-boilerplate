import type { CSSProperties, ReactNode } from 'react';
import { themeVariables } from '@/lib/site-theme';

/**
 * The Balibu theme root. Every site component reads its colours, gutters and
 * type from the `--b-*` tokens this sets, so wrap a page (or a single
 * section) in it. `theme` takes the same owner overrides as /admin
 * (backgroundColor, textColor, headingPrimaryColor, primaryColor,
 * secondaryColor); a colour that would make text unreadable is ignored.
 * Children sit in a <main>, where the site's sign-painted heading style applies.
 */
export default function SiteFrame({
  theme,
  children,
  style,
}: {
  theme?: Partial<Record<string, string>>;
  children?: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div className="balibu-site" style={{ ...(themeVariables(theme) as CSSProperties), ...style }}>
      <main style={{ display: 'contents' }}>{children}</main>
    </div>
  );
}
