// components/ContactSection.tsx
'use client';

import { useMemo } from 'react';

interface ClientData {
  address: string;
  companyNumber: string;
  openTimes: Record<string, string>;
}

interface ContactSectionProps {
  address: string;
  companyNumber: string;
  openTimes: Record<string, string>;
}

const WEEKDAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'] as const;

export default function ContactSection({ address, companyNumber, openTimes = {} as Record<string, string> }: ContactSectionProps) {
  const mapSrc = useMemo(() => {
    if (!address) return '';
    return `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
  }, [address]);

  return (
  <section className="bg-[var(--site-background)] py-12 sm:py-16">
    <div className="max-w-6xl mx-auto px-4 space-y-8">
      <h2 className="text-center text-3xl font-serif font-bold">
        Contact Us
      </h2>
      <p className="text-center italic text-[#4A5058]">
        We’re here for you 24/7 — reach out or stop by.
      </p>

      {/* Three-card row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Card 1: Store hours */}
        <div className="p-6 bg-white rounded-sm shadow-md border-t-4 border-[#d6112c]">
          <h3 className="text-xl font-semibold mb-2">
            Store Hours
          </h3>
          <div className="grid grid-cols-1 gap-x-4 gap-y-2 text-sm">
            {WEEKDAYS.map((day) => {
              const times = openTimes?.[day]?.split(',') || [];
              return (
                <div key={day} className="flex justify-between">
                  <span className="font-medium text-[#24333F]">{day}</span>
                  <span className="text-[#4A5058]">
                    {times.map((t, i) => (
                      <span key={i} className="block">
                        {t.trim()}
                      </span>
                    ))}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card 2: Phone & address together */}
        <div className="p-6 bg-white rounded-sm shadow-md border-t-4 border-[#d6112c] space-y-4">
          <h3 className="text-xl font-semibold mb-2">
            Get in Touch
          </h3>
          <div>
            <h4 className="text-lg font-semibold">Phone</h4>
            <a
              href={`tel:${companyNumber}`}
              className="text-lg font-bold text-[#d6112c] hover:underline"
            >
              {companyNumber}
            </a>
          </div>
          <div>
            <h4 className="text-lg font-semibold">Address</h4>
            <p className="text-[#4A5058]">{address}</p>
          </div>
        </div>

        {/* Card 3: Map */}
        <div className="bg-white rounded-sm shadow-md border-t-4 border-[#d6112c] overflow-hidden">
          {/* Preserve aspect ratio with a fixed height on larger screens */}
          <div className="relative h-64">
            {mapSrc ? (
              <iframe
                src={mapSrc}
                allowFullScreen
                loading="lazy"
                className="absolute inset-0 w-full h-full border-0"
                title="Store Location"
              />
            ) : (
              <p className="flex items-center justify-center h-full text-sm text-[#4A5058]">
                Map unavailable
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  </section>
);
}
