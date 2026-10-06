'use client';

import { useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

// Keep the first client render identical to the server. CSS media queries
// provide the immediate static layout before this preference is hydrated.
export function useMotionPreference() {
  const preference = useReducedMotion();
  const [reduced, setReduced] = useState(false);
  useEffect(() => setReduced(Boolean(preference)), [preference]);
  return reduced;
}
