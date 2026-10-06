'use client';

import { useEffect, useState } from 'react';
import { openState, type OpenState } from '@/lib/site-hours';
import type { RestaurantClient } from '@/lib/site-content';

/** Client-only so server and first render agree; refreshes each minute. */
export function useOpenState(client: RestaurantClient | undefined, live: boolean) {
  const [state, setState] = useState<OpenState | null>(null);
  useEffect(() => {
    const update = () => setState(openState(client, live));
    update();
    const timer = window.setInterval(update, 60_000);
    return () => window.clearInterval(timer);
  }, [client, live]);
  return state;
}
