// app/page.tsx
'use client';

import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { Star } from 'lucide-react';

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

  // BG IMAGE
  const [bgImage, setBgImage] = useState<string>('');

  // aboutUs
  const [aboutUs, setAboutUs] = useState<string>('');


  // bookingAccess
  const [bookingAccess, setBookingAccess] = useState<boolean>(false);

  const [clientData, setClientData] = useState<ClientResponse | null>(null);
  const [menuData, setMenuData] = useState<MenuResponse | null>(null);



  // // Fetch primaryColor from API and convert ARGB → CSS hex
  // useEffect(() => {
  //   async function loadTheme() {
  //     try {
  //       const res = await fetch('/api/client', {
  //         next: {
  //           revalidate: 3600, // 1 hour
  //         },
  //       });
  //       if (!res.ok) return;
  //       const { primaryColor: rawPrimary, secondaryColor: rawSecondary, bgImage: bgImage , aboutUs: aboutUs, bookingAccess: bookingAccess} =
  //         (await res.json()) as {
  //           primaryColor: string;
  //           secondaryColor: string;
  //           bgImage: string;
  //           aboutUs: string;
  //           bookingAccess: boolean;
  //         };

  //       setPrimaryColor('#' + rawPrimary.substring(rawPrimary.length - 6));
  //       setSecondaryColor('#' + rawSecondary.slice(-6));
  //       setBgImage(bgImage);
  //       setAboutUs(aboutUs); // Set aboutUs if available
  //       setBookingAccess(bookingAccess); // Default to false if not provided
  //     } catch {
  //       // keep default values if the fetch fails
  //     } finally {
  //       // Regardless of success or failure, stop showing the page-loading skeleton
  //       setIsPageLoading(false);
  //     }
  //   }
  //   loadTheme();
  // }, []);

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
            {/* Logo */}
            <Image
              src="/BalibuLogoLight.png"
              alt="Balibu Logo"
              width={100}
              height={100}
              className="object-contain -rotate-15"
            />

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
          <div className="absolute inset-0">
          {/* Placeholder while the real image loads */}
          {!isBgLoaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
              {/* Optional: a simple spinner could be placed here */}
            </div>
          )}

          <Image
            src={bgImage}
            alt="Hero background"
            fill
            className={`object-cover transition-opacity duration-500 ${isBgLoaded ? 'opacity-100' : 'opacity-0'}`}
            priority
            onLoadingComplete={() => setIsBgLoaded(true)}
          />
          <div className="absolute inset-0 bg-black/60"></div>
        </div>

          {/* Content */}
          <div className="relative max-w-6xl mx-auto flex flex-col-reverse lg:flex-row items-center px-4 py-12 sm:py-20">
            {/* Text & StoreHours */}
            <div className="w-full lg:w-1/2 space-y-4 lg:pr-16 text-white text-center lg:text-left">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white">
                IndoFusion Made Effortless
              </h1>
              <div className='flex justify-center lg:justify-start'>
                <StoreHoursWidget compact />
              </div>
              
              <div className="flex justify-center lg:justify-start space-x-4">
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
            </div>

            {/* Hero graphic: centered on mobile, right-aligned on lg+ */}
            <div className="w-full lg:w-1/2 flex items-center justify-center lg:justify-end mb-8 lg:mb-0">
              <div className="relative w-48 h-48 sm:w-64 sm:h-64 md:w-100 md:h-100 lg:w-120 lg:h-120">
                <Image
                  src="/FeatureImage.png"
                  alt="Hero graphic"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* ─── SCROLLING BANNER ───────────────────────────────────────────────── */}
        <Ticker />


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
                src="/menu/smoothie.jpg"
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

        {/* ─── FOR LUNCH ─────────────────────────────────────────────────────
        <section id="menu" className="max-w-6xl mx-auto text-center my-12 sm:my-16 px-4 space-y-6">
          <h3 className="text-xl font-semibold text-[#24333F]">For Lunch</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
          </div>
          <Button variant="outline" color={primaryColor} className="py-2 px-6">
            Full menu
          </Button>
        </section> */}

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
                src="/menu/bowl.jpg"
                alt="Signature bowl"
                fill
                className="object-cover"
              />
            </div>
            <div className="space-y-2 text-sm sm:text-base text-[#24333F] max-h-[60vh] overflow-y-auto">
              <p>
                Founded in 2022 by lifelong friends with a shared passion for vibrant flavors and mindful dining, Balibu was born from the simple idea that good food should nourish both body and soul. Inspired by the bold spices of Indonesia and the laid-back cool of coastal vibes, we’ve crafted an IndoFusion menu where every dish feels like a celebration of fresh ingredients and soulful tradition.
              </p>
              <p>
                From our very first day, we set out not just to serve meals, but to build a community. Whether you’re dropping in for a quick lunch or gathering with friends for an evening feast, we want every visit to feel effortless, intuitive, and—most importantly—deliciously memorable. That’s why we’ve invested in seamless ordering technology, so you can place an order in seconds from your favorite device, and why our loyalty program makes it easy to earn rewards every time you dine.
              </p>
              <p>
                Behind the scenes, our kitchen team works with precision and care. Orders flow through our digital system straight to the chefs, ensuring that every bowl, roll, and plate reaches you at peak flavor and freshness. And as your tastes evolve, our menu adapts—bringing you seasonal specials that highlight the very best of each harvest.
              </p>
              <p>
                At Balibu, we believe great food starts with great relationships. From the farmers who grow our produce, to the friendly faces you see when you walk through our door, we’re united by a commitment to quality, speed, and genuine hospitality. Thank you for being part of our journey—here’s to many more shared moments and mouthwatering meals ahead.
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
