'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Disable SSR for CanvasBoard as it relies on browser window, canvas context, and audio APIs
const DynamicCanvasBoard = dynamic(
  () => import('@/components/CanvasBoard'),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#07090e] text-white gap-4">
        <div className="w-12 h-12 rounded-full border-2 border-indigo-500 border-t-cyan-400 animate-spin" />
        <div className="text-sm font-semibold tracking-wide text-slate-300">
          Entering Endlessync Universe...
        </div>
      </div>
    ),
  }
);

export default function CanvasPage() {
  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-[#07090e] select-none touch-none">
      <DynamicCanvasBoard />
    </div>
  );
}
