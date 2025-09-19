'use client';

import { useEffect } from 'react';
import { initWebVitals } from '@/lib/webVitals';

export function WebVitalsScript() {
  useEffect(() => {
    // Initialize web vitals collection
    initWebVitals();
  }, []);

  return null; // This component doesn't render anything
}
