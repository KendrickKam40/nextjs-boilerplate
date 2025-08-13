// app/page.tsx
'use client';

import { useRef, useState, useEffect, useMemo } from 'react';
import NextImage from 'next/image';
import dynamic from 'next/dynamic';

import Button from '@/components/Button';
import Modal from '@/components/Modal';
import Ticker from '@/components/Ticker';
import Menu, { MenuOption } from '@/components/Menu';
import LoyaltyDashboard from '@/components/LoyaltyDashboard';
import SeasonalSpecialsWidget from '@/components/SeasonalSpecialsWidget';
import ContactSection from '@/components/ContactSection';
import CategoryCarousel from '@/components/CategoryCarousel';

const StoreHoursWidget = dynamic(
  () => import('@/components/StoreHoursWidget'),
  { ssr: true }
);

interface Category {
  name: string;
  visible?: boolean;
  avalibleFrom?: string;
  avalibleTo?: string;
  days?: string[];
  order?: number;
}
interface CategoryResponse {
  categories: Category[];
}

interface ClientResponse {
  primaryColor: string;
  secondaryColor: string;
  bgImage: string;
  aboutUs: string;
  bookingAccess: boolean;
  coverImage: string;
  address: string;
  companyNumber: string;
  openTimes: Record<string, string>;
  appDescription: string; // Optional field for app description
  logoImage: string; // Optional field for logo image
  kioskMessage?: string; // Optional field for kiosk message
  announceTitle?: string; // Optional field for announcement title
  littlesImages?: string[];
  openStatus?: number; // Optional field for open status
  // …include any other fields returned by /api/client
}

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  showCase: boolean;
  order: number;
  showOnDisplay: boolean; // Use this field to filter specials
  category?: string; // Optional category field for filtering
}

interface MenuResponse {
  menuItems: MenuItem[];
}

export default function HomePage() {
  const [isPageLoading, setIsPageLoading] = useState(true);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [activeModal, setActiveModal] =  useState<'about' | 'points' | 'order' | 'booking' |''>('');
  // Close the order overlay using browser history when possible
  const closeOrder = () => {
    try {
      if (typeof window !== 'undefined' && window.history?.state?.modal === 'order') {
        // consume the history entry we added on open
        window.history.back();
        return;
      }
    } catch {}
    setActiveModal('');
  };

  // Make the Order overlay back-button friendly: push state on open, close on back
  useEffect(() => {
    if (activeModal !== 'order') return;

    const onPop = () => {
      setActiveModal('');
    };

    // push a transient history entry so Back will close the overlay
    try {
      window.history.pushState({ modal: 'order' }, '');
      window.addEventListener('popstate', onPop);
    } catch {}

    return () => {
      // remove listener; don't call back() here because closeOrder handles UI closes
      window.removeEventListener('popstate', onPop);
    };
  }, [activeModal]);

  useEffect(() => {
    if (activeModal !== 'order') return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeOrder(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeModal]);

  const [isBgReady, setIsBgReady] = useState(false);
  const [primaryColor, setPrimaryColor] = useState<string>('#d6112c');
  const [secondaryColor, setSecondaryColor] = useState('#9a731e');

  // Logo Image
  const [logoImage, setLogoImage] = useState<string>('/BalibuLogoLight.png');

  // BG IMAGE
  const [bgImage, setBgImage] = useState<string>('');

  // aboutUs
  const [aboutUs, setAboutUs] = useState<string>('');

  // 
  const [appDescription, setAppDescription] = useState<string>('');

  // bookingAccess
  const [bookingAccess, setBookingAccess] = useState<boolean>(false);

  const [clientData, setClientData] = useState<ClientResponse | null>(null);
  const [menuData, setMenuData] = useState<MenuResponse | null>(null);


  // category carousel state
  const [categoriesData, setCategoriesData] = useState<CategoryResponse | null>(null);

  useEffect(() => {
    async function loadInitialData() {
      try {
        const bootRes = await fetch('/api/client'); // now returns combined
        if (!bootRes.ok) throw new Error('Failed to fetch API data');

        const bootJson = (await bootRes.json()) as {
          client: ClientResponse;
          menuItems: MenuItem[];
          categories: Category[];
        };

        // Split and set
        const clientJson = bootJson.client;
        const menuJson: MenuResponse = { menuItems: bootJson.menuItems };
        const categoriesJson: CategoryResponse = { categories: bootJson.categories };


        // update colours and state from client data
        setPrimaryColor('#' + clientJson.primaryColor.slice(-6));
        setSecondaryColor('#' + clientJson.secondaryColor.slice(-6));
        setBgImage(clientJson.bgImage);
        setAboutUs(clientJson.aboutUs);
        setBookingAccess(clientJson.bookingAccess);
        setAppDescription(clientJson.appDescription || ''); // Set app description if available
        setLogoImage(clientJson.logoImage); // Fallback to default logo if not provided
        setClientData(clientJson);
        setMenuData(menuJson);
        setCategoriesData(categoriesJson);

      } catch (err) {
        // handle error and keep fallback values
        console.error(err);
      } finally {
        setIsPageLoading(false);
      }
    }
    loadInitialData();
  }, []);

  // Choose a single ticker phrase (Staays-style)
  const tickerPhrase = useMemo(() => {
    const fromApi = clientData?.kioskMessage || clientData?.announceTitle || '';
    const fallback = 'Fresh Local Meets Indonesian Spice';
    return (fromApi && fromApi.trim().length > 0) ? fromApi.trim() : fallback;
  }, [clientData]);

  const hasShowcase = useMemo(() => {
    const items = menuData?.menuItems ?? [];
    return items.some((it: any) => {
      const flag = it?.showCase ?? it?.showcase ?? it?.isShowcase ?? it?.featured;
      return typeof flag === 'string' ? flag.toLowerCase() === 'true' : Boolean(flag);
    });
  }, [menuData]);

  const topCategories = useMemo(() => {
    const all = categoriesData?.categories ?? [];
    if (all.length === 0) return [] as Category[];

    const now = new Date();
    const weekday = now.toLocaleDateString(undefined, { weekday: 'long' });
    const toMins = (hhmm?: string) => {
      if (!hhmm || hhmm.length < 3) return 0;
      const h = parseInt(hhmm.slice(0, 2), 10) || 0;
      const m = parseInt(hhmm.slice(2, 4) || '0', 10) || 0;
      return h * 60 + m;
    };
    const cur = now.getHours() * 60 + now.getMinutes();

    // visible + available today + time window
    let filtered = all.filter((c) => {
      const vis = c.visible !== false;
      const daysOk = !c.days || c.days.includes(weekday);
      const from = toMins(c.avalibleFrom);
      const to = toMins(c.avalibleTo);
      const timeOk = to === 0 ? true : cur >= from && cur <= to;
      return vis && daysOk && timeOk;
    });

    // Filter out categories with no menu items (case-insensitive, trimmed match)
    const menuItems = menuData?.menuItems ?? [];
    filtered = filtered.filter((cat) => {
      const catName = (cat.name ?? '').trim().toLowerCase();
      if (!catName) return false;
      return menuItems.some(
        (item) =>
          typeof item.category === 'string' &&
          item.category.trim().toLowerCase() === catName
      );
    });

    // uniquify by name, then sort
    const map = new Map<string, Category>();
    for (const c of filtered) {
      const key = (c.name || '').trim();
      if (!key) continue;
      if (!map.has(key)) map.set(key, c);
    }

    return Array.from(map.values())
      .sort((a, b) => {
        const ao = Number.isFinite(a.order as number) ? (a.order as number) : 9999;
        const bo = Number.isFinite(b.order as number) ? (b.order as number) : 9999;
        if (ao !== bo) return ao - bo;
        return String(a.name).localeCompare(String(b.name));
      })
      .slice(0, 5);
  }, [categoriesData, menuData]);

  // Preload bg image (more robust than relying on onLoadingComplete)
  useEffect(() => {
    setIsBgReady(false);
    if (!bgImage) return;

    // Create a manual Image to trigger onload even for cached images in Safari
    const img = new window.Image();
    // Hint the browser this image can be decoded off the main thread
    // (ignored by some browsers but harmless)
    // @ts-ignore
    img.decoding = 'async';
    img.onload = () => setIsBgReady(true);
    img.onerror = () => {
      // Fail open: don't leave users stuck on a grey screen
      setIsBgReady(true);
      if (process.env.NODE_ENV !== 'production') {
        console.warn('Hero bg failed to load:', bgImage);
      }
    };
    img.src = bgImage;

    return () => {
      // prevent state updates after unmount
      img.onload = null as any;
      img.onerror = null as any;
    };
  }, [bgImage]);

  // Lock body scroll while full-screen order view is open
  useEffect(() => {
    if (activeModal === 'order') {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [activeModal]);

  const options: MenuOption[] = [
    { label: 'Order Online', onClick: () => setActiveModal('order') },
    { label: 'Our Story',   onClick: () => setActiveModal('about') },
  ];

  // If page is still loading, show a skeleton
  if (isPageLoading) {
    return (
      <main className="min-h-screen bg-[#FAF3EA]">
        <div className="animate-pulse max-w-6xl mx-auto px-4 py-12 space-y-6">
          {/* Skeleton for header */}
          <div className="h-12 bg-gray-300 rounded-md"></div>
          {/* Skeleton for hero section */}
          <div className="h-64 bg-gray-200 rounded-md"></div>
          {/* Skeleton for the About or other sections */}
          <div className="h-48 bg-gray-200 rounded-md"></div>
          <div className="h-48 bg-gray-200 rounded-md"></div>
          {/* Skeleton for footer */}
          <div className="h-12 bg-gray-300 rounded-md"></div>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="min-h-screen bg-[#FAF3EA]">

        {/* ─── HEADER ───────────────────────────────────────────────────────── */}
        <header className="absolute inset-x-0 top-0 z-50">
          <div className="max-w-6xl mx-auto flex items-center justify-between py-4 px-4 sm:py-6">
            <div></div>

            {/* Icons & Menu */}
            <div className="flex items-center space-x-4">
              {/* <button
                onClick={() => setActiveModal('points')}
                aria-label="My Points"
                className="p-1 rounded-full hover:bg-white/20"
              >
                <Star className="w-5 h-5 text-white" />
              </button> */}
              <Menu options={options} buttonColor="#fff" />
            </div>
          </div>
        </header>

        {/* ─── HERO ──────────────────────────────────────────────────────────── */}
        <section className="relative w-full pt-20 pb-10">
          {/* Background image & overlay */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Placeholder while the real image loads */}
            {!isBgReady && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center" />
            )}

            {/* Animated wrapper so transforms apply reliably */}
            <div className={`absolute inset-0 transition-opacity duration-500 kenburns ${isBgReady ? 'opacity-100' : 'opacity-0'}`}>
              <NextImage
                key={bgImage}            // force remount when URL changes
                src={bgImage}
                alt="Hero background"
                fill
                sizes="100vw"           // help responsive loading
                fetchPriority="high"    // hint critical priority
                className="object-cover"
                priority
                onLoad={() => setIsBgReady(true)}
              />
            </div>

            <div className="absolute inset-0 bg-black/60" />
          </div>

          {/* Content */}
          <div className="relative max-w-6xl mx-auto px-4 py-16 sm:py-24 flex flex-col items-center text-white text-center gap-6">
            <div className="w-full max-w-2xl mx-auto space-y-6">
              <NextImage
                src="/BalibuLogoLight.png"
                alt="Balibu Logo"
                width={400}
                height={400}
                className="object-contain mx-auto w-full max-w-[300px] sm:max-w-[400px] h-auto sm:max-h-none max-h-[200px]"
              />

              <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
                <Button
                  color={primaryColor}
                  className="py-2 px-12 text-sm"
                  onClick={() => setActiveModal('order')}
                >
                  Order Online
                </Button>
                {bookingAccess && (
                  <Button
                    variant="outline"
                    color={secondaryColor}
                    className="py-2 px-12 text-sm"
                    onClick={() => setActiveModal('booking')}
                  >
                    Book Online
                  </Button>
                )}
              </div>

              <div className='flex justify-center'>
                <StoreHoursWidget
                  compact
                  data={{
                    openTimes: clientData?.openTimes ?? {},
                    openStatus: clientData?.openStatus ?? 0
                  }}
                  loading={false} // or your page-level loading flag
                  error={null}
                />
              </div>
            </div>
          </div>
          <style jsx>{`
@-webkit-keyframes kenburns {
  0%   { -webkit-transform: scale(1) translate3d(0,0,0) rotate(0deg); transform: scale(1) translate3d(0,0,0) rotate(0deg); }
  50%  { -webkit-transform: scale(1.14) translate3d(0,-2.5%,0) rotate(0.25deg); transform: scale(1.14) translate3d(0,-2.5%,0) rotate(0.25deg); }
  100% { -webkit-transform: scale(1.28) translate3d(0,-5%,0) rotate(0.5deg); transform: scale(1.28) translate3d(0,-5%,0) rotate(0.5deg); }
}
@keyframes kenburns {
  0%   { -webkit-transform: scale(1) translate3d(0,0,0) rotate(0deg); transform: scale(1) translate3d(0,0,0) rotate(0deg); }
  50%  { -webkit-transform: scale(1.14) translate3d(0,-2.5%,0) rotate(0.25deg); transform: scale(1.14) translate3d(0,-2.5%,0) rotate(0.25deg); }
  100% { -webkit-transform: scale(1.28) translate3d(0,-5%,0) rotate(0.5deg); transform: scale(1.28) translate3d(0,-5%,0) rotate(0.5deg); }
}
.kenburns {
  -webkit-animation: kenburns 40s ease-in-out infinite alternate;
  animation: kenburns 40s ease-in-out infinite alternate;
  -webkit-transform-origin: center center;
  transform-origin: center center;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  will-change: transform;
  -webkit-transform: translateZ(0);
  transform: translateZ(0);
}
@media (max-width: 640px) {
  .kenburns { -webkit-animation-duration: 32s; animation-duration: 32s; }
}
@media (prefers-reduced-motion: reduce) {
  .kenburns { -webkit-animation: none; animation: none; }
}
          `}</style>
        </section>

        {/* ─── SCROLLING BANNER ───────────────────────────────────────────────── */}
        <Ticker phrase={tickerPhrase} />


        {/* ─── OUR STORY ────────────────────────────────────────────────────── */}
        <section
          id="about"
          className="bg-[#faf3ea] py-16" // soft, vibrant backdrop reminiscent of Staays’ Stories section
        >
          <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
            <h2 className="text-4xl font-serif font-bold text-[#24333F]">
              Our Story
            </h2>
            {/* Prominent image with rounded corners and shadow */}
            <div className="relative mx-auto w-full h-64 sm:h-72 md:h-80 rounded-2xl overflow-hidden shadow-md">
              <NextImage
                src="/OURSTORY_Pic.jpg"
                alt="Our history"
                fill
                className="object-cover"
                priority
              />
            </div>
            {/* Centered description */}
            <p className="text-lg leading-relaxed text-[#4A5058]">
              {aboutUs}
            </p>
          </div>
        </section>

        {/* ─── SEASONAL OFFERS ──────────────────────────────────────────────── */}

        {clientData && menuData && hasShowcase ? (
          <SeasonalSpecialsWidget
            coverImage={'/seasonalSpecials.JPG'}
            menuItems={menuData?.menuItems}
          />
        ) : (clientData && topCategories.length > 0 ? (
          <CategoryCarousel
            heading="Explore by Category"
            subheading="From IndoFusion bowls to sweet treats — browse by what you’re craving."
            categories={topCategories}
            // images={clientData?.littlesImages ?? []}   // optional: can omit entirely
            // imagesByCategory={{ 'Smoothies': '/imgs/smoothies.jpg' }} // optional fine control
            onAllClick={() => setActiveModal('order')}
            primaryColor={primaryColor}
            menuItems={menuData?.menuItems}
          />
        ) : null)}  

        {clientData && (
          <div id="contact" className="max-w-6xl mx-auto my-12 sm:my-16 px-4 space-y-6">
            <ContactSection
              address={clientData.address}
              companyNumber={clientData.companyNumber}
              openTimes={clientData.openTimes}
            />
          </div>
        )}

      
        {/* ─── FOOTER ──────────────────────────────────────────────────────── */}
        <footer className="max-w-6xl mx-auto text-center py-6 text-xs text-[#24333F]">
          &copy; 2025 Balibu
        </footer>

        {/* ─── MODALS & IFRAME ─────────────────────────────────────────────── */}
        <Modal
          open={activeModal === 'about'}
          title="Our Story"
          bgColor="#F2EAE2"
          textColor="#000"
          width="600px"
          onClose={() => setActiveModal('')}
        >
          <div className="space-y-4">
            <div className="relative w-full h-40 sm:h-60 overflow-hidden rounded-2xl">
              <NextImage
                src="/OURSTORY_Pic.jpg"
                alt="bgImage"
                fill
                className="object-cover"
              />
            </div>
            <div className="space-y-2 text-sm sm:text-base text-[#24333F] max-h-[60vh] overflow-y-auto text-center">
              <p>
                {appDescription}
              </p>
            </div>
          </div>
        </Modal>

        <Modal
          open={activeModal === 'points'}
          title="My Points"
          bgColor="#F2EAE2"
          textColor="#000"
          width="400px"
          onClose={() => setActiveModal('')}
        >
          <div className="mx-auto w-full max-w-xs">
            <LoyaltyDashboard />
          </div>
        </Modal>

        {activeModal === 'order' && (
          <div
            className="fixed inset-0 z-[70] bg-white"
            role="dialog"
            aria-modal="true"
            aria-label="Order Online"
          >
            {/* Top bar */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b bg-[#F2EAE2]" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
              <h2 className="text-base sm:text-lg font-semibold text-[#24333F]">Order Online</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={closeOrder}
                  aria-label="Close"
                  className="h-11 w-11 rounded-full grid place-items-center hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style={{ color: '#24333F' }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Full-viewport iframe */}
            <div className="w-full" style={{ height: 'calc(100vh - 56px)' }}>
              <iframe
                src="https://ordering.balibu.co.nz/"
                title="Order Online"
                className="w-full h-full"
              />
            </div>

            <style jsx>{`
              @media (max-width: 640px) {
                /* Ensure the iframe fills under varying header heights on mobile */
                div[role='dialog'] > div + div { height: calc(100vh - 56px); }
              }
            `}</style>
          </div>
        )}

        <Modal
          open={activeModal === 'booking'}
          title="Book Online"
          bgColor="#F2EAE2"
          textColor="#000"
          width="90%"
          onClose={() => setActiveModal('')}
        >
          <div className="relative w-full h-[80vh]">
            <iframe
              src="https://booking.balibu.co.nz/"
              title="Book Online"
              className="w-full h-full rounded-md"
            />
          </div>
        </Modal>

        {/* (Optional) Remove the hidden prefetch iframe if not needed */}
      </main>
    </>
  );
}
