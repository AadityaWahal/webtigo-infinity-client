'use client';

import dynamic from 'next/dynamic';

// Next.js tries to server-side render everything by default.
// Konva heavily relies on the `window` object which doesn't exist on the server.
// We disable SSR for CanvasBoard entirely so it only loads on the client.
const DynamicCanvasBoard = dynamic(
  () => import('@/components/CanvasBoard'),
  { ssr: false }
);

export default function Home() {
  return (
    <main className="w-screen h-screen overflow-hidden m-0 p-0">
      <DynamicCanvasBoard />
    </main>
  );
}
