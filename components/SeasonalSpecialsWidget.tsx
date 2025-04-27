// components/SeasonalSpecialsWidget.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Star, Loader2 } from 'lucide-react';

interface ClientData {
  coverImage: string;
}

/**
 * Client Component: fetches client.coverImage and displays
 * it with a dynamic “TODAY’S SPECIAL” banner.
 */
export default function SeasonalSpecialsWidget() {
  const [coverImage, setCoverImage] = useState<string>('');
  const [dayName, setDayName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/client');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as ClientData;
        setCoverImage(data.coverImage);

        const now = new Date();
        const weekday = now
          .toLocaleDateString('en-US', { weekday: 'long' })
          .toUpperCase();
        setDayName(weekday);
      } catch (err: any) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="bg-[#F2EAE2] p-6 rounded-2xl w-full border border-[#EAE0DA] flex flex-col items-center justify-center space-y-2">
        <Loader2 className="h-6 w-6 text-[#d6112c] animate-spin" />
        <span className="text-[#4A5058]">Loading specials…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#F2EAE2] p-6 rounded-2xl w-full border border-[#EAE0DA] flex flex-col items-center justify-center space-y-2">
        <Star className="h-6 w-6 text-[#EF4444]" />
        <span className="text-[#EF4444]">Error: {error}</span>
      </div>
    );
  }

  return (
    <div className="bg-[#F2EAE2] rounded-2xl w-full border border-[#EAE0DA] overflow-hidden shadow-md">
      {/* Header */}
      <div className="flex items-center space-x-2 px-6 py-4">
        <Star className="h-5 w-5 text-[#d6112c]" />
        <h4 className="text-lg font-semibold text-[#24333F]">
          TODAY’S SPECIAL: <span className="uppercase text-[#d6112c]">{dayName}</span>
        </h4>
      </div>

      {/* Cover Image */}
      <div className="relative h-56 w-full">
        <Image
          src={coverImage}
          alt="Seasonal special cover"
          fill
          className="object-cover"
          priority
        />
      </div>
    </div>
  );
}
