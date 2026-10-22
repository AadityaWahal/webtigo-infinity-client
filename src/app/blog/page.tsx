'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import BlogGuide from '@/components/BlogGuide';

function BlogContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const initialTab: 'story' | 'guide' = tabParam === 'guide' ? 'guide' : 'story';

  return <BlogGuide initialTab={initialTab} />;
}

export default function BlogPage() {
  return (
    <main className="min-h-screen w-full bg-[#07090e]">
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-[#07090e] text-slate-400 text-sm">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
              <span>Loading Endlessync Documentation...</span>
            </div>
          </div>
        }
      >
        <BlogContent />
      </Suspense>
    </main>
  );
}
