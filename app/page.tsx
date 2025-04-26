// app/page.tsx
'use client';

import Image from 'next/image';
import React , {useState} from 'react';
import { Menu as MenuIcon, MapPin, Star } from 'lucide-react';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Modal from '@/components/Modal';    // ← import

export default function HomePage() {
  const [activeModal, setActiveModal] = useState<'about' | ''>('');

  return (
    <main className="min-h-screen bg-[#F33550] flex flex-col justify-center items-center p-4 space-y-6">
      {/* Top Navigation */}
      <header className="w-full max-w-md">
        <div className="flex items-center justify-between bg-black text-white rounded-2xl p-3">
          <span className="font-bold text-sm">TODAY’S SPECIAL: MONDAY BLUES</span>
          <MenuIcon className="h-6 w-6" />
        </div>
      </header>

      {/* Main Card with Hero Image and Logo */}
      <section className="w-full max-w-md">
        <Card bgColor="#F2EAE2" className="p-6">
          {/* Hero Image with overlayed logo */}
          <div className="relative h-70 w-full overflow-hidden rounded-2xl">
            <Image
              src="/menu/bowl.jpg"
              alt="Signature smoothie"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <Image
                src="/BalibuLogoLight.png"
                alt="Balibu Logo"
                width={200}
                height={200}
              />
            </div>
          </div>
          {/* Card Content */}
          <div className="pt-6 flex flex-col items-center space-y-4">
            <Button fullWidth color="#F33550">
              ORDER ONLINE
            </Button>
            <div className="flex w-full gap-3">
              <Button variant="outline" color="#F33550" className="flex-1" onClick={() => setActiveModal('about')}>
                ABOUT US
              </Button>
              <Button variant="outline" color="#F33550" className="flex-1">
                OUR STORY
              </Button>
            </div>
            <p className="text-sm text-[#F33550]">OPEN 9AM–8PM</p>
          </div>
        </Card>
      </section>

      {/* Bottom Info Cards */}
      <section className="w-full max-w-md grid grid-cols-2 gap-4">
        <Card bgColor="#F2EAE2" className="flex flex-col items-center justify-center py-6">
          <MapPin className="h-8 w-8 mb-2 text-black" />
          <span className="font-semibold text-sm text-black">Find Us!</span>
        </Card>
        <Card bgColor="#F2EAE2" className="flex items-center py-6 px-4">
          <Star className="h-8 w-8 mr-2 text-black" />
          <div>
            <p className="text-xs text-black">Your points balance:</p>
            <p className="text-xl font-bold text-black">50 Points</p>
          </div>
        </Card>
      </section>

      <Modal
        open={activeModal === 'about'}
        title="About Us"
        bgColor="#F2EAE2"    
        textColor="#000000"   
        width='400px'
        onClose={() => setActiveModal('')}
      >
        <div className='relative h-70 w-full overflow-hidden rounded-2xl'>
        <Image
          src="/menu/bowl.jpg"
          alt="Signature smoothie"
         fill
          className="object-cover"
          priority
        ></Image>
        </div>
       
        <p>
          Founded in 2022 with a passion for wellness, Balibu crafts every menu
          item from the freshest ingredients. Our mission is to nourish both body
          and soul.
        </p>
      </Modal>
    </main>
  );
}