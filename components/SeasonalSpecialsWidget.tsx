// components/SeasonalSpecialsWidget.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Loader2, Star } from 'lucide-react';

interface ClientResponse {
  coverImage: string;
}

interface MenuResponse {
  menuItems: Array<{
    id: string;
    name: string;
    description?: string;
    price: number;
    showCase: boolean;
    order: number;
  }>;
}

interface Special {
  name: string;
  description: string;
  price: string;
}

export default function SeasonalSpecialsWidget() {
  const [coverImage, setCoverImage] = useState<string>('');
  const [specials, setSpecials] = useState<Special[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        // Fetch client metadata and menu items in parallel
        const [clientRes, menuRes] = await Promise.all([
          fetch('/api/client'),
          fetch('/api/menu'),
        ]);

        if (!clientRes.ok) throw new Error(`Client error: ${clientRes.status}`);
        if (!menuRes.ok) throw new Error(`Menu error: ${menuRes.status}`);

        const clientData = (await clientRes.json()) as ClientResponse;
        const menuData = (await menuRes.json()) as MenuResponse;

        // Set the banner image
        setCoverImage(clientData.coverImage);

        // Filter for showCase items, sort by `order`, and take the first four
        const featured = menuData.menuItems
          .filter(item => item.showCase)
          .sort((a, b) => a.order - b.order)
          .slice(0, 4)
          .map(item => ({
            name: item.name,
            description: (item.description || '').trim(),
            price: `$${item.price.toFixed(2)}`,
          }));

        setSpecials(featured);
      } catch (err: any) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="bg-white p-6 w-full flex flex-col items-center justify-center space-y-2">
        <Loader2 className="h-6 w-6 text-[#d6112c] animate-spin" />
        <span className="text-[#4A5058]">Loading specials…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 w-full flex flex-col items-center justify-center space-y-2">
        <Star className="h-6 w-6 text-[#EF4444]" />
        <span className="text-[#EF4444]">Error: {error}</span>
      </div>
    );
  }

  if (!loading && !error && specials.length === 0) {
    return null;
  }

  return (
    <section className="bg-white py-12 sm:py-16">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center px-4">
        <div className="w-full space-y-4">
          <div className="bg-white w-full overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
              {/* Title & List */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-[#24333F]">
                  Check out our{' '}
                  <span className="block text-2xl font-serif">Seasonal Offers</span>
                </h4>
                <div className="space-y-4">
                  {specials.map((item, i) => (
                    <div
                      key={i}
                      className={`flex justify-between items-start ${
                        i < specials.length - 1 ? 'border-b border-[#EAE0DA] pb-4' : ''
                      }`}
                    >
                      <div className="pr-4">
                        <p className="text-[#24333F] font-medium">{item.name}</p>
                        {item.description && (
                          <p className="text-[#4A5058] text-sm">{item.description}</p>
                        )}
                      </div>
                      <p className="text-[#24333F] font-medium">{item.price}</p>
                    </div>
                  ))}
                </div>
              </div>
              {/* Cover Image */}
              <div className="relative w-full h-56 sm:h-64 lg:h-full lg:pl-12 rounded-2xl overflow-hidden shadow-md">
                <Image
                  src={coverImage}
                  alt="Seasonal special cover"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
