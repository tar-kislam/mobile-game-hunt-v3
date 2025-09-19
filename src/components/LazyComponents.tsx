'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect, useRef } from 'react';

// Dynamic imports for heavy components
const Galaxy = dynamic(() => import('@/components/Galaxy'), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-slate-800" />
});

const Shuffle = dynamic(() => import('@/components/Shuffle'), {
  ssr: false,
  loading: () => <span className="text-4xl font-bold text-white">Loading...</span>
});

interface LazyGalaxyProps {
  mouseRepulsion?: boolean;
  mouseInteraction?: boolean;
  density?: number;
  glowIntensity?: number;
  saturation?: number;
  hueShift?: number;
  className?: string;
}

export function LazyGalaxy(props: LazyGalaxyProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={props.className}>
      {isVisible ? <Galaxy {...props} /> : <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-slate-800" />}
    </div>
  );
}

interface LazyShuffleProps {
  text: string;
  shuffleDirection?: string;
  duration?: number;
  animationMode?: string;
  shuffleTimes?: number;
  ease?: string;
  stagger?: number;
  threshold?: number;
  loop?: boolean;
  loopDelay?: number;
  className?: string;
}

export function LazyShuffle(props: LazyShuffleProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref}>
      {isVisible ? <Shuffle {...props} /> : <span className={props.className}>{props.text}</span>}
    </div>
  );
}
