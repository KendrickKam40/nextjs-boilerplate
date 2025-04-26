// app/page.tsx
'use client';
import { useRef, useState } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { ShoppingCart, BookOpen, Star } from 'lucide-react';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Modal from '@/components/Modal';
import Menu, { MenuOption } from '@/components/Menu';
import LoyaltyDashboard from '@/components/LoyaltyDashboard';
import SeasonalSpecialsWidget from '@/components/SeasonalSpecialsWidget';

const StoreHoursWidget = dynamic(
  () => import('@/components/StoreHoursWidget'),
  { ssr: true }
);

export default function HomePage() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [activeModal, setActiveModal] = useState<'about' | 'points' | ''>('');

  const handleRedeem = (amount: number) => {
    const win = iframeRef.current?.contentWindow;
    if (!win) return;
    win.postMessage({ action: 'redeemPoints', amount }, '*');
  };
  

  const options: MenuOption[] = [
    { label: 'Order Online', onClick: () => {/* ordering logic */} },
    { label: 'About Us',    onClick: () => setActiveModal('about') },
    { label: 'Our Story',   onClick: () => {/* story logic */} },
    { label: 'My Points',   onClick: () => {/* points modal logic */} },
  ];

  return (
    <main className="min-h-screen bg-[#FAF3EA] flex flex-col items-center px-4 sm:px-6 lg:px-12 py-6 space-y-6">

      {/* Top Navigation */}
      <header className="w-full max-w-6xl grid grid-cols-3 items-center px-4">
      {/* left slot: empty to balance the logo */}
      <div className="flex justify-start">
          <StoreHoursWidget compact/>
        </div>

      {/* center slot: logo */}
      <div className="flex justify-center">
        <Image
          src="/BalibuLogo.png"
          alt="Balibu Logo"
          width={120}
          height={40}
          priority
        />
      </div>

      {/* right slot: your Menu */}
      <div className="flex items-center justify-end space-x-4">
          {/* 1. Star icon opens the points modal */}
          <button
            onClick={() => setActiveModal('points')}
            aria-label="My Points"
            className="relative p-1 rounded-full hover:bg-black/10"
          >
            <Star className="h-6 w-6 text-[#24333F]" />
           
          </button>

          {/* 2. your hamburger menu */}
          <Menu options={options} buttonColor="#24333F" />
        </div>
    </header>

      {/* Hero Section */}
      <section className="w-full max-w-6xl flex flex-col-reverse lg:flex-row items-center bg-[#F2EAE2] rounded-2xl overflow-hidden shadow-md">
        {/* Text & CTA */}
        <div className="w-full lg:w-1/2 p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-[#24333F] leading-tight">
            Smoked flavors, chilled vibes, Balibu style.
          </h1>
          <p className="text-base sm:text-lg text-[#4A5058]">
            Blending fresh ingredients with soulful recipes, Balibu is all about nourishing body & soul.
          </p>
          <Button fullWidth color="#d6112c" className="text-sm sm:text-base py-2">VIEW FULL MENU</Button>
        </div>
        {/* Hero Image */}
        <div className="relative w-full lg:w-1/2 h-48 sm:h-64 md:h-80 lg:h-100">
          <Image
            src="/menu/bowl.jpg"
            alt="Signature bowl"
            fill
            className="object-cover"
            priority
          />
        </div>
      </section>

      {/* Quick Action Cards */}
      <section className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        {[{
          icon: <ShoppingCart className="h-10 w-10 text-[#d6112c]" />,
          title: 'Order Online',
          text: 'Start your order now',
          btn: <Button color="#d6112c" className="w-full text-sm py-2">Start Order</Button>,
        },{
          icon: <BookOpen className="h-10 w-10 text-[#d6112c]" />,
          title: 'Our Story',
          text: 'Learn more about us',
          btn: <Button variant="outline" color="#d6112c" className="w-full text-sm py-2" onClick={() => setActiveModal('about')}>Read More</Button>,
        },
        // {
        //   icon: <Star className="h-10 w-10 text-[#d6112c]" />,
        //   title: 'Your Points',
        //   text: '',
        //   btn: <LoyaltyDashboard currentPoints={points} nextTier={200} onRedeem={handleRedeem} />,
        // }
        ].map((card, i) => (
          <Card key={i} bgColor="#F2EAE2" className="px-4 sm:px-6 py-6 flex flex-col items-center text-center space-y-3">
            {card.icon}
            <h3 className="text-lg font-semibold text-[#24333F]">{card.title}</h3>
            {card.text && <p className="text-[#4A5058] text-sm">{card.text}</p>}
            {card.btn}
          </Card>
        ))}

        <SeasonalSpecialsWidget />
      </section>


      {/* About Us Modal */}
      <Modal
        open={activeModal === 'about'}
        title="About Us"
        bgColor="#F2EAE2"
        textColor="#000"
        width="400px"
        onClose={() => setActiveModal('')}
      >
        <div className="relative w-full h-40 sm:h-60 overflow-hidden rounded-2xl mb-4">
          <Image
            src="/menu/bowl.jpg"
            alt="Signature bowl"
            fill
            className="object-cover"
          />
        </div>
        <p className="text-sm sm:text-base">
          Founded in 2022 with a passion for wellness, Balibu crafts every menu
          item from the freshest ingredients. Our mission is to nourish both body
          and soul.
        </p>
      </Modal>

    <Modal
      open={activeModal === 'points'}
      title="My Points"
      bgColor="#F2EAE2"
      textColor="#000"
      width="400px"
      onClose={() => setActiveModal('')}
    >
      <div className="px-4 py-2">
        <LoyaltyDashboard
          nextTier={200}
          onRedeem={handleRedeem}
        />
      </div>
    </Modal>

      {/* Footer */}

      <footer className="w-full max-w-6xl text-center py-6 text-xs sm:text-sm text-[#24333F]">
        &copy; 2024 Balibu &nbsp;|&nbsp; Privacy &nbsp;|&nbsp; Terms
      </footer>

      {/* Hidden iframe for ordering integration */}
      <iframe ref={iframeRef} className="hidden" src="https://order.example.com" />
    </main>
  );
}
