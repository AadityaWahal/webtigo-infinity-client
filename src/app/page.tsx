'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import LandingPage from '@/components/LandingPage';
import BlogGuide from '@/components/BlogGuide';

// Disable SSR for CanvasBoard as it relies on browser window, canvas context, and audio APIs
const DynamicCanvasBoard = dynamic(
  () => import('@/components/CanvasBoard'),
  { ssr: false }
);

export default function Home() {
  const [currentView, setCurrentView] = useState<'landing' | 'canvas' | 'blog'>('landing');
  const [blogTab, setBlogTab] = useState<'story' | 'guide'>('story');

  const handleOpenBlog = (tab: 'story' | 'guide' = 'story') => {
    setBlogTab(tab);
    setCurrentView('blog');
  };

  return (
    <main className="w-screen h-screen overflow-hidden m-0 p-0 relative bg-[#07090e]">
      {currentView === 'landing' && (
        <LandingPage
          onEnterCanvas={() => setCurrentView('canvas')}
          onOpenBlog={handleOpenBlog}
        />
      )}

      {currentView === 'blog' && (
        <div className="w-full h-full overflow-y-auto animate-in fade-in duration-300">
          <BlogGuide
            initialTab={blogTab}
            onEnterCanvas={() => setCurrentView('canvas')}
            onBackToHome={() => setCurrentView('landing')}
          />
        </div>
      )}

      {currentView === 'canvas' && (
        <div className="w-full h-full animate-in fade-in zoom-in-95 duration-300">
          <DynamicCanvasBoard
            onBackToLanding={() => setCurrentView('landing')}
            onOpenBlog={handleOpenBlog}
          />
        </div>
      )}
    </main>
  );
}
