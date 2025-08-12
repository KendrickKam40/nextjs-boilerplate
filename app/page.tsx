// app/page.tsx
'use client';

import { useRef, useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';

import Button from '@/components/Button';
import Modal from '@/components/Modal';
import Ticker from '@/components/Ticker';
import Menu, { MenuOption } from '@/components/Menu';
import LoyaltyDashboard from '@/components/LoyaltyDashboard';
import SeasonalSpecialsWidget from '@/components/SeasonalSpecialsWidget';
import ContactSection from '@/components/ContactSection';

const StoreHoursWidget = dynamic(
  () => import('@/components/StoreHoursWidget'),
  { ssr: true }
);

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
  // …include any other fields returned by /api/client
}

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  showCase: boolean;
  order: number;
}

interface MenuResponse {
  menuItems: MenuItem[];
}

export default function HomePage() {
  const [isPageLoading, setIsPageLoading] = useState(true);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [activeModal, setActiveModal] =  useState<'about' | 'points' | 'order' | 'booking' |''>('');
  const [isBgLoaded, setIsBgLoaded] = useState(false);
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


  useEffect(() => {
    async function loadInitialData() {
      try {
        // fetch both endpoints in parallel
        const [clientRes, menuRes] = await Promise.all([
          fetch('/api/client'),
          fetch('/api/menu'),
        ]);
        if (!clientRes.ok || !menuRes.ok) {
          throw new Error('Failed to fetch API data');
        }
        const clientJson = (await clientRes.json()) as ClientResponse;
        const menuJson = (await menuRes.json()) as MenuResponse;

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

  // Reset background image loading state when bgImage changes
  useEffect(() => {
    setIsBgLoaded(false);
  }, [bgImage]);

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
            {!isBgLoaded && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center" />
            )}

            {/* Animated wrapper so transforms apply reliably */}
            <div className={`absolute inset-0 transition-opacity duration-500 kenburns ${isBgLoaded ? 'opacity-100' : 'opacity-0'}`}>
              <Image
                src={bgImage}
                alt="Hero background"
                fill
                className="object-cover"
                priority
                onLoadingComplete={() => setIsBgLoaded(true)}
              />
            </div>

            <div className="absolute inset-0 bg-black/60" />
          </div>

          {/* Content */}
          <div className="relative max-w-6xl mx-auto px-4 py-16 sm:py-24 flex flex-col items-center text-white text-center gap-6">
            <div className="w-full max-w-2xl mx-auto space-y-6">
              <Image
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
                <StoreHoursWidget compact />
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
          className="bg-[#FFFFFF] py-16" // soft, vibrant backdrop reminiscent of Staays’ Stories section
        >
          <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
            <h2 className="text-4xl font-serif font-bold text-[#24333F]">
              Our Story
            </h2>
            {/* Prominent image with rounded corners and shadow */}
            <div className="relative mx-auto w-full h-64 sm:h-72 md:h-80 rounded-2xl overflow-hidden shadow-md">
              <Image
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

        {clientData && menuData && (
          <SeasonalSpecialsWidget
            coverImage={clientData.coverImage}
            menuItems={menuData.menuItems}
          />
        )}

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
              <Image
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

        <Modal
          open={activeModal === 'order'}
          title="Order Online"
          bgColor="#F2EAE2"
          textColor="#000"
          width="90%"
          onClose={() => setActiveModal('')}
        >
          <div className="relative w-full h-[80vh]">
            <iframe
              src="https://ordering.balibu.co.nz/"
              title="Order Online"
              className="w-full h-full rounded-md"
            />
          </div>
        </Modal>

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

        <iframe
          ref={iframeRef}
          className="hidden"
          src="https://order.example.com"
        />
      </main>
    </>
  );
}
