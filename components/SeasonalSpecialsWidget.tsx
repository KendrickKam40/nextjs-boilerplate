// components/SeasonalSpecialsWidget.tsx
'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';

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

interface SeasonalSpecialsWidgetProps {
  coverImage: string;
  menuItems: MenuResponse['menuItems'];
}

export default function SeasonalSpecialsWidget({ coverImage, menuItems = [] }: SeasonalSpecialsWidgetProps) {

  const specials = useMemo<Special[]>(() => {
    return menuItems
      .filter(item => item.showCase)
      .sort((a, b) => a.order - b.order)
      .slice(0, 4)
      .map(item => ({
        name: item.name,
        description: (item.description || '').trim(),
        price: `$${item.price.toFixed(2)}`,
      }));
  }, [menuItems]);

  // If there are no showcase items, render nothing to avoid empty spacing
  if (specials.length === 0) {
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
                <h4 className="text-lg font-semibold">
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
