"use client"

import React, { useEffect, useRef } from 'react';

interface FuzzyTextProps {
  children: React.ReactNode;
  fontSize?: string | number;
  fontWeight?: number;
  fontFamily?: string;
  color?: string;
  enableHover?: boolean;
  baseIntensity?: number;
  hoverIntensity?: number;
}

const FuzzyText = ({
  children,
  fontSize = 'clamp(2rem, 10vw, 10rem)',
  fontWeight = 900,
  fontFamily = 'inherit',
  color = '#fff',
  enableHover = true,
  baseIntensity = 0.18,
  hoverIntensity = 0.5
}: FuzzyTextProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let animationFrameId: number;
    let isCancelled = false;
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Performance: Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Browser Compatibility: Detect Safari/WebKit
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    const init = async () => {
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }
      if (isCancelled) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const computedFontFamily =
        fontFamily === 'inherit' ? window.getComputedStyle(canvas).fontFamily || 'sans-serif' : fontFamily;

      const fontSizeStr = typeof fontSize === 'number' ? `${fontSize}px` : fontSize;
      let numericFontSize: number;
      if (typeof fontSize === 'number') {
        numericFontSize = fontSize;
      } else {
        // Browser Compatibility: Better handling for Safari/WebKit
        const temp = document.createElement('span');
        temp.style.fontSize = fontSize;
        temp.style.fontFamily = computedFontFamily;
        temp.style.fontWeight = String(fontWeight);
        temp.style.position = 'absolute';
        temp.style.visibility = 'hidden';
        temp.style.whiteSpace = 'nowrap';
        temp.textContent = 'M'; // Use character for better measurement
        document.body.appendChild(temp);
        const computedSize = window.getComputedStyle(temp).fontSize;
        numericFontSize = parseFloat(computedSize);
        document.body.removeChild(temp);
        
        // Safari/WebKit: Aggressively override if calculation seems wrong
        if (isSafari) {
          // Safari often miscalculates clamp(), use manual calculation
          const viewportWidth = window.innerWidth;
          
          // If original calculation seems wrong (too small)
          if (numericFontSize < 50) {
            // clamp(2rem, 8vw, 6rem) manual calculation
            const minSize = 32; // 2rem = 32px
            const maxSize = 96; // 6rem = 96px
            const preferredSize = (viewportWidth * 0.08); // 8vw
            numericFontSize = Math.min(Math.max(minSize, preferredSize), maxSize);
            console.log(`[Safari Fix] Original: ${numericFontSize}px -> Corrected: ${numericFontSize}px`);
          }
        }
      }

      const text = React.Children.toArray(children).join('');

      const offscreen = document.createElement('canvas');
      const offCtx = offscreen.getContext('2d');
      if (!offCtx) return;

      offCtx.font = `${fontWeight} ${fontSizeStr} ${computedFontFamily}`;
      offCtx.textBaseline = 'alphabetic';
      const metrics = offCtx.measureText(text);

      const actualLeft = metrics.actualBoundingBoxLeft ?? 0;
      const actualRight = metrics.actualBoundingBoxRight ?? metrics.width;
      const actualAscent = metrics.actualBoundingBoxAscent ?? numericFontSize;
      const actualDescent = metrics.actualBoundingBoxDescent ?? numericFontSize * 0.2;

      const textBoundingWidth = Math.ceil(actualLeft + actualRight);
      const tightHeight = Math.ceil(actualAscent + actualDescent);

      const extraWidthBuffer = 10;
      const offscreenWidth = textBoundingWidth + extraWidthBuffer;

      offscreen.width = offscreenWidth;
      offscreen.height = tightHeight;

      const xOffset = extraWidthBuffer / 2;
      offCtx.font = `${fontWeight} ${fontSizeStr} ${computedFontFamily}`;
      offCtx.textBaseline = 'alphabetic';
      offCtx.fillStyle = color;
      offCtx.fillText(text, xOffset - actualLeft, actualAscent);

      const horizontalMargin = 50;
      const verticalMargin = 0;
      canvas.width = offscreenWidth + horizontalMargin * 2;
      canvas.height = tightHeight + verticalMargin * 2;
      ctx.translate(horizontalMargin, verticalMargin);

      const interactiveLeft = horizontalMargin + xOffset;
      const interactiveTop = verticalMargin;
      const interactiveRight = interactiveLeft + textBoundingWidth;
      const interactiveBottom = interactiveTop + tightHeight;

      let isHovering = false;
      let isVisible = true; // Performance: Track visibility
      const fuzzRange = 30;

      // Performance: Reduce animation complexity if reduced motion is preferred
      const frameSkip = prefersReducedMotion ? 5 : 1; // Skip frames for reduced motion
      let frameCount = 0;

      const run = () => {
        if (isCancelled) return;
        
        // Performance: Skip animation when off-screen
        if (!isVisible) {
          animationFrameId = window.requestAnimationFrame(run);
          return;
        }

        // Performance: Frame skipping for reduced motion
        frameCount++;
        if (prefersReducedMotion && frameCount % frameSkip !== 0) {
          animationFrameId = window.requestAnimationFrame(run);
          return;
        }

        ctx.clearRect(-fuzzRange, -fuzzRange, offscreenWidth + 2 * fuzzRange, tightHeight + 2 * fuzzRange);
        const intensity = isHovering ? hoverIntensity : baseIntensity;
        
        // Performance: Use faster drawing for base intensity
        if (!isHovering && baseIntensity < 0.3) {
          // Faster static rendering when not hovering
          ctx.drawImage(offscreen, 0, 0);
        } else {
          // Full fuzzy effect
          for (let j = 0; j < tightHeight; j++) {
            const dx = Math.floor(intensity * (Math.random() - 0.5) * fuzzRange);
            ctx.drawImage(offscreen, 0, j, offscreenWidth, 1, dx, j, offscreenWidth, 1);
          }
        }
        animationFrameId = window.requestAnimationFrame(run);
      };

      // Performance: Intersection Observer to pause when off-screen
      const observer = new IntersectionObserver(
        (entries) => {
          isVisible = entries[0].isIntersecting;
        },
        { threshold: 0.1 }
      );
      observer.observe(canvas);

      run();

      const isInsideTextArea = (x: number, y: number) => {
        return x >= interactiveLeft && x <= interactiveRight && y >= interactiveTop && y <= interactiveBottom;
      };

      const handleMouseMove = (e: MouseEvent) => {
        if (!enableHover) return;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        isHovering = isInsideTextArea(x, y);
      };

      const handleMouseLeave = () => {
        isHovering = false;
      };

      const handleTouchMove = (e: TouchEvent) => {
        if (!enableHover) return;
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        isHovering = isInsideTextArea(x, y);
      };

      const handleTouchEnd = () => {
        isHovering = false;
      };

      if (enableHover) {
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseleave', handleMouseLeave);
        canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
        canvas.addEventListener('touchend', handleTouchEnd);
      }

      const cleanup = () => {
        window.cancelAnimationFrame(animationFrameId);
        observer.disconnect(); // Performance: Clean up observer
        if (enableHover) {
          canvas.removeEventListener('mousemove', handleMouseMove);
          canvas.removeEventListener('mouseleave', handleMouseLeave);
          canvas.removeEventListener('touchmove', handleTouchMove);
          canvas.removeEventListener('touchend', handleTouchEnd);
        }
      };

      // Store cleanup function on canvas for later use
      (canvas as any).cleanupFuzzyText = cleanup;
    };

    init();

    return () => {
      isCancelled = true;
      window.cancelAnimationFrame(animationFrameId);
      const canvas = canvasRef.current;
      if (canvas && (canvas as any).cleanupFuzzyText) {
        (canvas as any).cleanupFuzzyText();
      }
    };
  }, [children, fontSize, fontWeight, fontFamily, color, enableHover, baseIntensity, hoverIntensity]);

  return (
    <canvas 
      ref={canvasRef} 
      style={{ 
        display: 'block', 
        margin: '0 auto',
        minWidth: '200px',
        minHeight: '80px'
      }} 
    />
  );
};

export default FuzzyText;
