'use client';
import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import {
  onAuthStateChanged,
  signOut,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from 'firebase/auth';
import Button from './Button';

export default function LoyaltyDashboard() {
  const router = useRouter();

  // Auth + data state
  const [phone, setPhone] = useState('');
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const [currentPoints, setCurrentPoints] = useState(0);

  // OTP state (6 digits)
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const inputsRef = useRef<Array<HTMLInputElement | null>>(Array(6).fill(null));

  // Loading flags
  const [loadingSms, setLoadingSms] = useState(false);
  const [loadingVerify, setLoadingVerify] = useState(false);
  const [loadingLogout, setLoadingLogout] = useState(false);
  const [loadingPoints, setLoadingPoints] = useState(true);

  // Format date for card
  const formattedDate = new Date().toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  // Listen for auth changes & fetch points
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setLoadingLogout(false);
        setLoadingPoints(true);
        try {
          const idToken = await user.getIdToken();
          const res = await fetch('/api/points', {
            headers: { Authorization: `Bearer ${idToken}` },
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.json();
          setCurrentPoints(data.points);
        } catch (err) {
          console.error('fetch points failed:', err);
        } finally {
          setLoadingPoints(false);
        }
      } else {
        // Reset on logout
        setPhone('');
        setConfirmation(null);
        setCurrentPoints(0);
        setOtp(Array(6).fill(''));
        setLoadingPoints(false);
        setLoadingLogout(false);
      }
    });
    return unsubscribe;
  }, []);

  // Send SMS
  const sendSms = async () => {
    setLoadingSms(true);
    try {
      const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
      });
      const cr = await signInWithPhoneNumber(auth, phone, verifier);
      setConfirmation(cr);
      // focus first input
      setTimeout(() => inputsRef.current[0]?.focus(), 300);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSms(false);
    }
  };

  // Verify code
  const verifyCode = async () => {
    if (!confirmation) return;
    const code = otp.join('');
    if (code.length < 6) return;
    setLoadingVerify(true);
    try {
      await confirmation.confirm(code);
    } catch (err) {
      console.error('Bad code', err);
    } finally {
      setLoadingVerify(false);
    }
  };

  // Logout
  const handleLogout = async () => {
    setLoadingLogout(true);
    try {
      await signOut(auth);
      router.refresh();
    } finally {
      setLoadingLogout(false);
    }
  };

  // Handler for OTP input change
  const handleOtpChange = (value: string, idx: number) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[idx] = value;
    setOtp(newOtp);
    if (value && idx < 5) {
      inputsRef.current[idx + 1]?.focus();
    }
  };

  // Handler for key navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    }
  };

  // Loading spinner while fetching points
  if (loadingPoints) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-gray-400 opacity-75" />
      </div>
    );
  }

  // Login view: mobile verification instructions
  if (!auth.currentUser) {
    return (
      <>
        <div id="recaptcha-container" />
        <div className="bg-white rounded-2xl p-4 space-y-4 max-w-xs border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Mobile Verification</h3>
          <p className="text-sm text-gray-600">
            Enter your mobile number below to receive a verification code. Once verified, you'll be able to view your loyalty points.
          </p>

          {!confirmation ? (
            <>
              <input
                type="tel"
                placeholder="e.g. +1 650-555-1234"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2 border rounded-lg border-gray-300"
              />
              <Button
                fullWidth
                onClick={sendSms}
                color="#000000"
                className="bg-white border border-gray-300 text-gray-900"
                loading={loadingSms}
              >
                Send Verification Code
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-600">
                We’ve sent a code to <span className="font-medium">{phone}</span>. Enter it below to continue.
              </p>
              <div className="flex space-x-2 justify-center">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => { inputsRef.current[idx] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(e.target.value, idx)}
                    onKeyDown={e => handleKeyDown(e, idx)}
                    className="w-10 h-10 text-center border rounded-lg border-gray-300"
                  />
                ))}
              </div>
              <Button
                fullWidth
                onClick={verifyCode}
                color="#000000"
                className="bg-white border border-gray-300 text-gray-900"
                loading={loadingVerify}
              >
                Verify Code
              </Button>
            </>
          )}
        </div>
      </>
    );
  }

  // Dashboard view as sleek Apple-style card
  return (
    <>
      <div id="recaptcha-container" />
      <div className="space-y-4 max-w-xs">
        <div className="relative bg-gradient-to-tr from-gray-100 to-gray-200 text-gray-900 rounded-2xl p-6 shadow-lg">
          <div className="absolute top-4 right-4 opacity-10 text-6xl">🎁</div>
          <p className="text-sm uppercase tracking-wide">Reward Points</p>
          <h3 className="text-3xl font-semibold mt-1">{currentPoints}</h3>
          <p className="mt-2 text-xs opacity-70">Updated {formattedDate}</p>
        </div>
        <Button
          fullWidth
          variant="outline"
          onClick={handleLogout}
          color="#4B5563"
          className="text-sm border-gray-300"
          loading={loadingLogout}
        >
          Logout
        </Button>
      </div>
    </>
  );
}
