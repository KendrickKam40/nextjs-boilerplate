// components/StoreHoursWidget.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface ClientData {
  openTimes: Record<string, string>;
  openStatus: number;
}

interface StoreHoursWidgetProps {
  /** whether to render in a slim “header” style */
  compact?: boolean;
  /**
   * Prefer passing the client data from the parent (page.tsx) to avoid
   * duplicate API calls. If provided, this component will not fetch.
   */
  data?: ClientData | null;
  /** Optional parent-driven loading & error (if parent is fetching). */
  loading?: boolean;
  error?: string | null;
}

export default function StoreHoursWidget({ compact = false, data: dataProp = null, loading: loadingProp, error: errorProp }: StoreHoursWidgetProps) {
  // Internal state only used when data is not provided by parent
  const [dataInternal, setDataInternal] = useState<ClientData | null>(null);
  const [loadingInternal, setLoadingInternal] = useState<boolean>(true);
  const [errorInternal, setErrorInternal] = useState<string | null>(null);

  const shouldFetch = dataProp == null; // if parent didn't pass data, we fetch as a fallback

  useEffect(() => {
    if (!shouldFetch) {
      // If parent supplies data, ensure internal loading is false
      setLoadingInternal(false);
      setErrorInternal(null);
      return;
    }

    let cancelled = false;
    async function load() {
      try {
        setLoadingInternal(true);
        setErrorInternal(null);
        const res = await fetch('/api/client', { cache: 'no-store' }); // always fresh for status
        if (!res.ok) throw new Error('Network response was not ok');
        const boot = (await res.json()) as { client?: any };
        const c = boot?.client ?? {};
        const normalized: ClientData = {
          openTimes: (c.openTimes ?? {}) as Record<string, string>,
          openStatus: Number(c.openStatus ?? 0),
        };
        if (!cancelled) setDataInternal(normalized);
      } catch (err: any) {
        if (!cancelled) setErrorInternal(err.message);
      } finally {
        if (!cancelled) setLoadingInternal(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [shouldFetch]);

  // Resolve the effective sources (parent wins)
  const data = dataProp ?? dataInternal;
  const loading = loadingProp ?? loadingInternal;
  const error = errorProp ?? errorInternal;

  // loading / error: for compact, keep it minimal
  if (compact) {
    if (loading || error || !data) {
      return (
        <div className="flex items-center space-x-1 text-xs text-[#FFFFFF] opacity-100">
          <Clock className="h-4 w-4 animate-pulse" />
          <span>…</span>
        </div>
      );
    }
  } else {
    if (loading) {
      return (
        <div className="bg-[#F2EAE2] p-6 rounded-2xl w-full flex items-center justify-center">
          <Clock className="h-6 w-6 text-[#d6112c] animate-pulse" />
          <p className="ml-2 text-[#4A5058]">Loading store hours…</p>
        </div>
      );
    }
    if (error || !data) {
      return (
        <div className="bg-[#F2EAE2] p-6 rounded-2xl w-full flex items-center justify-center">
          <Clock className="h-6 w-6 text-[#EF4444]" />
          <p className="ml-2 text-[#EF4444]">Unable to load store hours</p>
        </div>
      );
    }
  }

  const { openTimes, openStatus } = data!;
  const now = new Date();
  const todayName = now.toLocaleDateString('en-AU', { weekday: 'long' });
  const rawToday = openTimes?.[todayName];
  const todayHours = typeof rawToday === 'string' && rawToday.trim() ? rawToday : 'Closed';
  const isOpen = openStatus === 1;

  if (compact) {
    return (
      <div className="flex items-center text-[#FFFFFF]">
        <Clock className={`h-4 w-4 ${isOpen ? 'text-[#22C55E]' : 'text-[#EF4444]'}`} />
        <span className="ml-1 text-s font-medium">{isOpen ? 'Open' : 'Closed'}</span>
        <span className="ml-1 text-x text-[#FFFFFF] hidden md:inline">· {todayHours.split(',').join(' | ')}</span>
      </div>
    );
  }

  // full version
  return (
    <div className="bg-[#F2EAE2] p-6 rounded-2xl w-full border border-[#EAE0DA]">
      <div className="flex items-center space-x-2 mb-2">
        <Clock className="h-5 w-5 text-[#d6112c]" />
        <h4 className="text-lg font-semibold text-[#24333F]">Store Hours</h4>
      </div>
      <div className="flex items-center justify-between">
        <span className={isOpen ? 'text-[#22C55E] font-bold' : 'text-[#EF4444] font-bold'}>
          {isOpen ? 'Open Now' : 'Closed'}
        </span>
        <span className="text-sm text-[#4A5058]">Today: {todayHours}</span>
      </div>
    </div>
  );
}
