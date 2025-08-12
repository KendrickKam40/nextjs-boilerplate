// components/ContactSection.tsx
'use client';

import { useEffect, useState } from 'react';

interface ClientData {
  address: string;
  companyNumber: string;
  openTimes: Record<string, string>;
}

const WEEKDAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export default function ContactSection() {
  const [companyAddress, setCompanyAddress] = useState('');
  const [companyNumber, setCompanyNumber] = useState('');
  const [openTimes, setOpenTimes] = useState<Record<string, string>>({});
  const [mapSrc, setMapSrc] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadClient() {
      try {
        const res = await fetch('/api/client', {
          next: {
            revalidate: 3600, // 1 hour
          },
        });
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const payload = await res.json();
        const client: ClientData = payload.client ?? payload;

        setCompanyAddress(client.address);
        setCompanyNumber(client.companyNumber);
        setOpenTimes(client.openTimes || {});
        setMapSrc(
          `https://www.google.com/maps?q=${encodeURIComponent(
            client.address
          )}&output=embed`
        );
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadClient();
  }, []);

  if (loading)
    return (
      <div className="text-center py-8 text-[#4A5058]">
        Loading contact info…
      </div>
    );
  if (error)
    return (
      <div className="text-center py-8 text-[#EF4444]">
        Unable to load contact info.
      </div>
    );

  return (
  <section className="bg-[#FAF3EA] py-12 sm:py-16">
    <div className="max-w-6xl mx-auto px-4 space-y-8">
      <h2 className="text-center text-3xl font-serif font-bold text-[#24333F]">
        Contact Us
      </h2>
      <p className="text-center italic text-[#4A5058]">
        We’re here for you 24/7 — reach out or stop by.
      </p>

      {/* Three-card row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Card 1: Store hours */}
        <div className="p-6 bg-white rounded-sm shadow-md border-t-4 border-[#d6112c]">
          <h3 className="text-xl font-semibold text-[#24333F] mb-2">
            Store Hours
          </h3>
          <div className="grid grid-cols-1 gap-x-4 gap-y-2 text-sm">
            {WEEKDAYS.map((day) => {
              const times = openTimes[day]?.split(',') || [];
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
          <h3 className="text-xl font-semibold text-[#24333F] mb-2">
            Get in Touch
          </h3>
          <div>
            <h4 className="text-lg font-semibold text-[#24333F]">Phone</h4>
            <a
              href={`tel:${companyNumber}`}
              className="text-lg font-bold text-[#d6112c] hover:underline"
            >
              {companyNumber}
            </a>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-[#24333F]">Address</h4>
            <p className="text-[#4A5058]">{companyAddress}</p>
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