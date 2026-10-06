'use client';

import { useEffect, useState } from 'react';
import { normalizeLayout, type LayoutConfig } from '@/lib/layout-config';
import type { RestaurantData } from '@/lib/site-content';

export function useRestaurant() {
  const [data, setData] = useState<RestaurantData | null>(null);
  const [preview, setPreview] = useState<LayoutConfig | null>(null);
  const [status, setStatus] = useState<'loading' | 'live' | 'unavailable'>(
    'loading',
  );

  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 8000);
    let mounted = true;
    const raw = new URLSearchParams(window.location.search).get(
      'layoutPreview',
    );
    if (raw) {
      try {
        let parsed;
        try {
          parsed = JSON.parse(raw);
        } catch {
          parsed = JSON.parse(decodeURIComponent(raw));
        }
        setPreview(normalizeLayout(parsed, 'home'));
      } catch {
        /* Invalid previews retain the published layout. */
      }
    }
    async function load() {
      try {
        const response = await fetch('/api/client', {
          signal: controller.signal,
          cache: 'no-store',
        });
        // A 503 still carries the owner's layout and colours; keep those.
        const result = (await response.json().catch(() => null)) as RestaurantData | null;
        if (!result) throw new Error('Live data unavailable');
        if (
          !result.client ||
          !Array.isArray(result.menuItems) ||
          !Array.isArray(result.categories)
        )
          throw new Error('Invalid restaurant response');
        if (mounted) {
          setData(result);
          setStatus(
            response.ok && result.source === 'live' ? 'live' : 'unavailable',
          );
        }
      } catch {
        if (mounted) setStatus('unavailable');
      } finally {
        window.clearTimeout(timeout);
      }
    }
    void load();
    return () => {
      mounted = false;
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, []);
  return { data, status, layout: preview ?? data?.layout };
}
