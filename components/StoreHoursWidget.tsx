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
}

export default function StoreHoursWidget({ compact = false }: StoreHoursWidgetProps) {
  const [data, setData] = useState<ClientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/client');
        if (!res.ok) throw new Error('Network response was not ok');
        const client = (await res.json()) as ClientData;
        setData(client);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // loading / error: for compact, just show nothing or a spinner
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
  const todayHours = openTimes[todayName] || 'Closed';
  const isOpen = openStatus === 1;

  if (compact) {
       return (
         <div className="flex items-center text-[#FFFFFF]">
           {/* always show just the clock & status text on xs */}
           <Clock
             className={`h-4 w-4 ${
               isOpen ? 'text-[#22C55E]' : 'text-[#EF4444]'
             }`}
           />
    
           <span className="ml-1 text-s font-medium">
             {isOpen ? 'Open' : 'Closed'}
           </span>
    
           {/* show hours at md+ */}
           <span className="ml-1 text-x text-[#FFFFFF] hidden md:inline">
             · {todayHours}
           </span>
         </div>
       );
  }

  // full version (unchanged)
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
