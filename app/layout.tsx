import './globals.css';
import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import type { ReactNode } from 'react';
import { FOOD_IMAGES } from '@/lib/site-imagery';

// Gerobak sign-painting: Bungee block capitals and a Yellowtail sign-writer's script.
const display = localFont({
  src: '../public/fonts/bungee-regular.ttf',
  variable: '--font-display',
  display: 'swap',
  weight: '400',
});
const script = localFont({
  src: '../public/fonts/yellowtail-regular.ttf',
  variable: '--font-script',
  display: 'swap',
  weight: '400',
});
const body = localFont({
  src: [
    {
      path: '../public/fonts/manrope-regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/manrope-bold.ttf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-body',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#bd2f1b',
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 'https://balibu.co.nz',
  ),
  title: 'Balibu — Big Flavour. Bali Soul.',
  description:
    'Indonesian soul. Local spirit. Explore bold flavours, comforting favourites and fresh smoothies at Balibu. Find your new favourite and order online.',
  openGraph: {
    title: 'Balibu — Big Flavour. Bali Soul.',
    description:
      'A little Bali. A lot of heart. Find your next favourite and order online.',
    images: [
      {
        url: FOOD_IMAGES.hero.src,
        width: FOOD_IMAGES.hero.width,
        height: FOOD_IMAGES.hero.height,
        alt: FOOD_IMAGES.hero.alt,
      },
    ],
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-NZ" className={`${display.variable} ${script.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
