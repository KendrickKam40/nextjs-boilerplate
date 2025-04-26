// components/LoyaltyDashboard.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Modal from './Modal';
import Button from './Button';

interface LoyaltyDashboardProps {
  /** Points needed to reach next tier/milestone */
  nextTier: number;
  /** Callback when points are redeemed; receives the amount redeemed */
  onRedeem: (amount: number) => void;
}

/**
 * A dashboard that first asks for email (once), remembers it in localStorage,
 * then shows points, progress bar, redemption CTA, and allows logout.
 * Styled to match Balibu’s main color scheme.
 */
const LoyaltyDashboard: React.FC<LoyaltyDashboardProps> = ({ nextTier, onRedeem }) => {
  const [email, setEmail] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPoints, setCurrentPoints] = useState(0);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);

  const accent = '#d6112c';
  const progressPct = Math.min((currentPoints / nextTier) * 100, 100);

  useEffect(() => {
    const savedEmail = localStorage.getItem('loyaltyEmail');
    const savedPoints = localStorage.getItem('loyaltyPoints');
    if (savedEmail && savedPoints) {
      setEmail(savedEmail);
      setCurrentPoints(Number(savedPoints));
      setIsVerified(true);
    }
  }, []);

  useEffect(() => {
    if (isVerified && currentPoints >= nextTier) setShowMilestoneModal(true);
  }, [isVerified, currentPoints, nextTier]);

  const handleVerify = async () => {
    setError(null);
    try {
      const res = await fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error('Failed to verify');
      const { points } = await res.json();
      setCurrentPoints(points);
      setIsVerified(true);
      localStorage.setItem('loyaltyEmail', email);
      localStorage.setItem('loyaltyPoints', String(points));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleRedeem = () => {
    onRedeem(currentPoints);
    const remaining = Math.max(currentPoints - nextTier, 0);
    setCurrentPoints(remaining);
    localStorage.setItem('loyaltyPoints', String(remaining));
  };

  const handleLogout = () => {
    localStorage.removeItem('loyaltyEmail');
    localStorage.removeItem('loyaltyPoints');
    setEmail('');
    setCurrentPoints(0);
    setIsVerified(false);
    setError(null);
  };

  if (!isVerified) {
    return (
      <div className="bg-[#F2EAE2] rounded-2xl p-4 space-y-4 max-w-xs border border-[#d6112c]">
        <h3 className="text-lg font-semibold text-[#24333F]">Loyalty Login</h3>
        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg"
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <Button
          fullWidth
          onClick={handleVerify}
          color={accent}
          className={`${!email && 'opacity-50 pointer-events-none'}`}
        >
          Verify
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-[#F2EAE2] rounded-2xl p-6 space-y-6 max-w-xs border border-[#d6112c]">
      <h3 className="text-xl font-semibold text-[#24333F]">Your Loyalty</h3>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-3 rounded-lg text-center">
          <p className="text-2xl font-bold text-[#d6112c]">{currentPoints}</p>
          <p className="text-sm text-[#24333F]">Points</p>
        </div>
        <div className="bg-white p-3 rounded-lg text-center">
          <p className="text-2xl font-bold text-[#24333F]">{Math.max(nextTier - currentPoints, 0)}</p>
          <p className="text-sm text-[#24333F]">To Next</p>
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-sm text-[#4A5058]">Progress</p>
        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
          <div
            className="h-full"
            style={{ width: `${progressPct}%`, backgroundColor: accent }}
          />
        </div>
      </div>

      <div className="flex space-x-2">
        <Button fullWidth onClick={handleRedeem} color={accent} className="text-sm">
          Redeem
        </Button>
        <Button fullWidth variant="outline" color={accent} className="text-sm">
          Logout
        </Button>
      </div>

      <Modal
        open={showMilestoneModal}
        title="Congrats!"
        bgColor="#FFFFFF"
        textColor="#000"
        width="280px"
        onClose={() => setShowMilestoneModal(false)}
      >
        <p className="text-center text-[#24333F]">{`You've reached ${nextTier} points!`}</p>
      </Modal>
    </div>
  );
};

export default LoyaltyDashboard;