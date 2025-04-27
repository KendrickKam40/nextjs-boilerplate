// components/ContactSection.tsx
'use client';

import { useEffect, useState } from 'react';

interface ClientData {
  companyAddress: string;
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
        const res = await fetch('/api/client');
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const payload = await res.json();
        const client: ClientData = payload.client ?? payload;

        setCompanyAddress(client.companyAddress);
        setCompanyNumber(client.companyNumber);
        setOpenTimes(client.openTimes || {});
        setMapSrc(
          `https://www.google.com/maps?q=${encodeURIComponent(
            client.companyAddress
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

  if (loading) return (
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
      <div className="max-w-6xl mx-auto px-4 space-y-8">
        <h2 className="text-2xl font-semibold font-serif text-[#24333F] text-center">
          Contact Us
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* LEFT: hours, phone, address */}
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-medium text-[#24333F] mb-2">
                Store Hours
              </h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                {WEEKDAYS.map(day => {
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

            <div>
              <h3 className="text-xl font-medium text-[#24333F] mb-2">
                Phone
              </h3>
              <a
                href={`tel:${companyNumber}`}
                className="text-lg font-medium text-[#d6112c] hover:underline"
              >
                {companyNumber}
              </a>
            </div>

            <div>
              <h3 className="text-xl font-medium text-[#24333F] mb-2">
                Address
              </h3>
              <p className="text-[#4A5058]">{companyAddress}</p>
            </div>
          </div>

          {/* RIGHT: map */}
          <div>
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden shadow-md">
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
  );
}