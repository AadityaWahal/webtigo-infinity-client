'use client';

import React, { useEffect } from 'react';
import { playClickSound } from '@/lib/soundEffects';

export default function SoundProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      // Trigger sound when clicking functional buttons, tabs, links, or custom interactive triggers
      const interactiveEl = target.closest(
        'button, [role="button"], a, input[type="button"], input[type="submit"], input[type="checkbox"], input[type="radio"], .interactive-btn, .satellite-btn, .main-pen-btn'
      );
      if (interactiveEl) {
        playClickSound();
      }
    };

    window.addEventListener('click', handleGlobalClick, { capture: true, passive: true });
    return () => window.removeEventListener('click', handleGlobalClick, { capture: true });
  }, []);

  return <>{children}</>;
}
