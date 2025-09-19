'use client';

import { getCLS, getFID, getFCP, getLCP, getTTFB, getINP } from 'web-vitals';

// Function to send vitals data to our API
function sendToAnalytics(metric: any) {
  const body = JSON.stringify({
    vitals: [{
      name: metric.name,
      value: metric.value,
      delta: metric.delta,
      id: metric.id,
      navigationType: metric.navigationType,
      rating: metric.rating,
    }],
    url: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: Date.now(),
  });

  // Send to our API endpoint
  fetch('/api/vitals', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body,
  }).catch((error) => {
    console.error('Failed to send vitals data:', error);
  });

  // Also log to console for debugging
  console.log('📊 Web Vital:', {
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
  });
}

// Initialize web vitals collection
export function initWebVitals() {
  // Only run in browser environment
  if (typeof window === 'undefined') return;

  // Collect all web vitals
  getCLS(sendToAnalytics);
  getFID(sendToAnalytics);
  getFCP(sendToAnalytics);
  getLCP(sendToAnalytics);
  getTTFB(sendToAnalytics);
  getINP(sendToAnalytics);

  console.log('🚀 Web Vitals monitoring initialized');
}

// Export individual functions for manual collection
export {
  getCLS,
  getFID,
  getFCP,
  getLCP,
  getTTFB,
  getINP,
};
