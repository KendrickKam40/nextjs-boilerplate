import type { ReactNode } from 'react';
import { StoreDisplay } from '@balibu/design-system';

// The display fills the whole screen (position: fixed). The transform makes this
// 16:9 box its screen, the way a counter TV is.
const Tv = ({ children }: { children: ReactNode }) => (
  <div style={{ position: 'relative', width: '100%', aspectRatio: '16 / 9', transform: 'translateZ(0)', overflow: 'hidden' }}>
    {children}
  </div>
);

/** The branded standby screen the TV shows before staff add videos. */
export const NoVideosYet = () => (
  <Tv>
    <StoreDisplay initial={{ ids: [], status: 'empty' }} />
  </Tv>
);

/** Settings unreachable: stays on brand and keeps retrying by itself. */
export const SettingsUnavailable = () => (
  <Tv>
    <StoreDisplay initial={{ ids: [], status: 'unavailable' }} />
  </Tv>
);
