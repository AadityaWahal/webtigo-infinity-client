import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Rocket, Globe2, ShieldCheck, Gamepad2, Layers, Heart, Code2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Endlessync | The Infinite Real-Time Collaborative Canvas',
  description:
    'Learn about Endlessync (formerly Webtigo Infinity Canvas), its architecture, mission to create an open global collaborative board, and the creative engineering behind boundless 2D synchronization.',
  alternates: {
    canonical: 'https://endlessync.vercel.app/about',
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 font-sans selection:bg-indigo-500 selection:text-white flex flex-col">
      {/* Background Ambience */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-indigo-600/15 via-cyan-600/10 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Grid Pattern */}
      <div
        className="fixed inset-0 pointer-events-none opacity-20 -z-10"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.18) 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Top Navbar */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 sm:px-12 py-4 border-b border-slate-800/80 backdrop-blur-xl bg-slate-900/60">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 text-xs font-medium text-slate-300 hover:text-white transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
          <div className="flex items-center gap-2">
            <img src="/media/endlessync-symbol.png" alt="Endlessync" className="w-5 h-5 object-contain" />
            <span className="text-sm font-bold text-white">
              Endless<span className="text-cyan-400">ync</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Link
            href="/blog?tab=story"
            className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition"
          >
            Founder&apos;s Story
          </Link>
          <Link
            href="/blog?tab=guide"
            className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition"
          >
            User Guide
          </Link>
          <Link
            href="/canvas"
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/20"
          >
            Launch Canvas
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-12">
        <article className="space-y-10 animate-in fade-in duration-300 text-left">
          {/* Header */}
          <div className="space-y-3 border-b border-slate-800 pb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-xs font-semibold text-indigo-300">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>About the Mission</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
              About Endlessync
            </h1>
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
              The story, engineering, and philosophical conviction behind the world&apos;s largest open digital whiteboard.
            </p>
          </div>

          <div className="space-y-8 text-slate-300 text-sm sm:text-base leading-relaxed">
            <p>
              In an internet fractured into siloed accounts, paywalled tools, and private invite-only boards, <strong>Endlessync</strong> (originally conceived as <em>Webtigo Infinity Canvas</em>) was created with a straightforward yet radical premise: <strong>What if the entire world shared a single, infinite canvas?</strong>
            </p>

            {/* Core Values */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Globe2 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">Boundary-Free</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  No edge boundaries. Scroll infinitely in any direction across billions of virtual pixels with instantaneous viewport culling.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Rocket className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">Real-Time Velocity</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Sub-50ms WebSocket broadcasting renders strokes, text annotations, and cursor presence live as creators collaborate globally.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400">
                  <Gamepad2 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">Work &amp; Play</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  More than just a whiteboard—features built-in 2D board games (Tic-Tac-Toe, Dots &amp; Boxes, Connect Four) with area physics.
                </p>
              </div>
            </div>

            {/* Origins */}
            <section className="space-y-4 pt-4 border-t border-slate-800">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Code2 className="w-5 h-5 text-cyan-400" />
                The Origin: 3 AM Epiphany
              </h2>
              <p>
                Founded and developed by <strong>Aaditya Wahal</strong>, the project originated late one evening at 3 AM. Staring into the night and questioning why digital whiteboards require teams to send invite links or create password-protected silos, the first prototype—Webtigo Infinity Canvas—was built.
              </p>
              <p>
                Reborn in 2026 as <strong>Endlessync</strong>, the platform integrates high-velocity WebSocket clustering, client-side viewport prediction, 2D jet thruster traversal, and persistent cloud storage to keep every sketch, drawing, and message alive indefinitely.
              </p>
              <div className="pt-2">
                <Link
                  href="/blog?tab=story"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-400 hover:text-cyan-300 underline underline-offset-4"
                >
                  <span>Read the Full Original Founder&apos;s Story</span>
                  <span>→</span>
                </Link>
              </div>
            </section>

            {/* Technology Stack */}
            <section className="space-y-4 pt-4 border-t border-slate-800">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-400" />
                Under the Hood: Technical Architecture
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-slate-300 text-sm">
                <li><strong>Next.js 15 &amp; React:</strong> Ultra-responsive modern user interface built with client-side canvas optimizations.</li>
                <li><strong>HTML5 Canvas API:</strong> Double-buffered vector stroke rendering engine for smooth 60fps freehand drawing and zooming.</li>
                <li><strong>WebSocket Cluster (Render):</strong> Bi-directional real-time telemetry pipeline for live cursor presence and stroke streaming.</li>
                <li><strong>Persistent Storage:</strong> Scalable MongoDB cloud database ensuring creations remain preserved 24/7 across sessions.</li>
                <li><strong>Edge CDN (Vercel):</strong> Zero-latency asset delivery worldwide with automatic TLS security.</li>
              </ul>
            </section>

            {/* CTA Box */}
            <div className="mt-10 p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
              <div className="space-y-1 text-left">
                <h3 className="text-xl font-bold text-white">Experience the Infinite Canvas</h3>
                <p className="text-xs sm:text-sm text-slate-400">
                  No sign-up, no barriers. Drop straight onto the coordinate plane and start creating.
                </p>
              </div>
              <Link
                href="/canvas"
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:brightness-110 active:scale-95 text-white text-sm font-bold shadow-xl shadow-indigo-600/30 transition flex items-center gap-2 shrink-0"
              >
                <Rocket className="w-4 h-4 text-amber-300" />
                <span>Launch Canvas</span>
              </Link>
            </div>
          </div>
        </article>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-800/80 text-center text-xs text-slate-400 backdrop-blur-md bg-slate-900/40">
        <p>© 2026 Endlessync. Infinite Collaborative Universe. All rights reserved.</p>
      </footer>
    </div>
  );
}
