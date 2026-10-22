'use client';

import React from 'react';
import {
  Rocket,
  Layers,
  Sparkles,
  ArrowRight,
  Radio,
  Type,
  Mic,
  Image as ImageIcon,
  Compass,
  Globe2,
  ShieldCheck,
  Palette,
  PaintBucket,
  BookOpen,
  PenTool,
  Eraser,
  Flame,
  MousePointer,
  HelpCircle,
} from 'lucide-react';

interface LandingPageProps {
  onEnterCanvas: () => void;
  onOpenBlog?: (tab?: 'story' | 'guide') => void;
}

export default function LandingPage({ onEnterCanvas, onOpenBlog }: LandingPageProps) {
  return (
    <div className="relative min-h-screen w-screen overflow-x-hidden bg-[#07090e] text-slate-100 font-sans selection:bg-indigo-500 selection:text-white flex flex-col">
      {/* Dynamic Ambient Glow Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-b from-indigo-600/20 via-cyan-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -left-48 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-2/3 -right-48 w-96 h-96 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Infinite Grid Background Overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.2) 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Top Navbar */}
      <nav className="relative z-20 flex items-center justify-between px-6 sm:px-12 py-5 border-b border-slate-800/60 backdrop-blur-md bg-slate-900/30">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 shadow-lg shadow-indigo-500/25 border border-indigo-400/40">
            <Layers className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-white">Endlessync</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                v2.0
              </span>
            </div>
            <p className="text-xs text-slate-400">The Infinite Real-Time Collaborative Canvas</p>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-xs text-emerald-400 font-medium">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>24/7 Global Sync Active</span>
          </div>

          {onOpenBlog && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenBlog('story')}
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 hover:text-white transition cursor-pointer"
              >
                <span>Founder's Story</span>
              </button>
              <button
                onClick={() => onOpenBlog('guide')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-cyan-300 hover:text-white transition cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                <span>User Guide</span>
              </button>
            </div>
          )}

          <button
            onClick={onEnterCanvas}
            className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:brightness-110 active:scale-95 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition cursor-pointer"
          >
            <span>Launch Canvas</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 sm:px-12 py-16 text-center max-w-5xl mx-auto space-y-16">
        {/* Futuristic Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 backdrop-blur-xl text-xs font-semibold text-indigo-300 shadow-sm animate-fade-in">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>Limitless Spatial Horizon • Real-Time WebSockets</span>
        </div>

        {/* Hero Title & Mission Statement */}
        <div className="space-y-6 max-w-3xl">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
            Draw, Record, and Explore on an{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Endless Plane
            </span>
          </h1>
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Endlessync is a persistent, boundless collaborative universe. Navigate at warp speed with
            2D rocket propulsion, sketch ideas with transparency-controlled vector brushes, and pin
            voice notes, text, and photos anywhere in infinite space.
          </p>
        </div>

        {/* Central Prominent CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onEnterCanvas}
            className="group relative flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:shadow-[0_0_40px_rgba(99,102,241,0.6)] active:scale-95 text-white text-base font-bold shadow-2xl transition duration-300 cursor-pointer border border-indigo-400/40"
          >
            <Rocket className="w-5 h-5 text-amber-300 group-hover:rotate-12 transition-transform duration-300" />
            <span>Enter Endlessync</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            <span className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-600 opacity-20 group-hover:opacity-60 blur-lg transition duration-300 -z-10" />
          </button>

          {onOpenBlog && (
            <button
              onClick={() => onOpenBlog('guide')}
              className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-200 hover:text-white text-base font-semibold transition cursor-pointer backdrop-blur-xl"
            >
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>Explore User Guide</span>
            </button>
          )}
        </div>

        {/* --------------------------------------------------------- */}
        {/* SHORTENED FOUNDER STORY SPOTLIGHT (The Midnight Spark)    */}
        {/* --------------------------------------------------------- */}
        <div className="w-full text-left p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-slate-900/90 via-indigo-950/30 to-slate-900/90 border border-indigo-500/30 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-semibold text-cyan-300">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>The Midnight Spark • 3 AM Origin</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                "What if the whole world was an infinitely large board?"
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Most tools lock you into private invite-only rooms or fleeting vertical feeds. Endlessync was born
                from a late-night epiphany: a truly infinite, open digital whiteboard where anyone can leave a mark,
                collaborate across continents, and explore boundless ideas simultaneously. Originally built as
                <em> Weptigo Infinity Canvas</em>, it has been reborn with high-velocity real-time WebSockets and AI acceleration.
              </p>
            </div>

            {onOpenBlog && (
              <button
                onClick={() => onOpenBlog('story')}
                className="shrink-0 flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-cyan-300 hover:text-white text-xs font-semibold transition cursor-pointer"
              >
                <span>Read Full Founder's Story</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* --------------------------------------------------------- */}
        {/* FRONT-END TOOLS & CONTROLS GUIDE (Tailored & Visual)      */}
        {/* --------------------------------------------------------- */}
        <div className="w-full space-y-8 text-left">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800 pb-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                <HelpCircle className="w-4 h-4" />
                <span>Quick Interactive Manual</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                Tools & Capabilities on the Infinite Grid
              </h2>
            </div>

            {onOpenBlog && (
              <button
                onClick={() => onOpenBlog('guide')}
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 transition cursor-pointer"
              >
                <span>Read Complete In-Depth Guide</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Tool 1: Navigation & Teleport */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 transition duration-300 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">1. Infinite Pan & Teleport</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Click-and-drag or hold <strong>Spacebar</strong> to pan anywhere on the Cartesian grid.
                The top-left HUD tracks your exact (X, Y) coordinates. Click <strong>Teleport</strong> to warp to any spot in seconds.
              </p>
            </div>

            {/* Tool 2: Rocket Thrusters */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/40 transition duration-300 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Flame className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">2. 2D Rocket Jet Propulsion</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Toggle the rocket icon at bottom-right. Click and hold the mouse button anywhere to fire jet thrusters.
                Cruise across light-years of canvas at <strong>10x, 24x, or 48x warp velocities</strong>.
              </p>
            </div>

            {/* Tool 3: Vector Pen & Shading */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/40 transition duration-300 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <PenTool className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">3. Vector Brushes & Shapes</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Draw zero-latency freehand vector strokes with custom widths (1px–48px). Use the geometric satellite
                to sketch rectangles, circles, arrows, and stars with transparent or solid fills.
              </p>
            </div>

            {/* Tool 4: Paint Eraser */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-rose-500/40 transition duration-300 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <Eraser className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">4. Paint-Style Precision Eraser</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Carves and trims touched strokes like MS Paint without deleting whole artworks in one touch.
                Adjust eraser radius scale from 12px to 80px directly from the eraser satellite.
              </p>
            </div>

            {/* Tool 5: Click-to-Paste Media Hub */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 transition duration-300 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Mic className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">5. Click-to-Paste Media Hub</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Click the bottom-left (+) button to type text notes, record voice notes with MediaRecorder, or upload photos.
                A plus (+) stamp cursor appears: simply click anywhere on the canvas to place your item.
              </p>
            </div>

            {/* Tool 6: Public Commons Etiquette */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 transition duration-300 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Globe2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">6. Global Commons Etiquette</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                There are no locked rooms or passwords—the canvas is a shared collective mural. Expand on existing
                doodles, layer notes collaboratively, and build mind maps together in real-time.
              </p>
            </div>
          </div>
        </div>

        {/* Architecture & 24/7 Hosting Reliability Callout */}
        <div className="w-full p-6 sm:p-8 rounded-3xl backdrop-blur-2xl bg-slate-900/40 border border-slate-800 text-left flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Immutable Shared Universe</span>
            </div>
            <h4 className="text-lg font-bold text-white">Built for 24/7 Global Synchronization</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Powered by high-performance WebSocket architecture hosted on Vercel & Render with
              automated self-ping keep-alive timers and MongoDB persistence. No user can wipe the world;
              your ideas remain intact indefinitely.
            </p>
          </div>

          <button
            onClick={onEnterCanvas}
            className="shrink-0 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-semibold transition cursor-pointer flex items-center gap-2"
          >
            <span>Launch Workbench</span>
            <ArrowRight className="w-4 h-4 text-cyan-400" />
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-20 py-6 border-t border-slate-800/60 text-center text-xs text-slate-400 backdrop-blur-md bg-slate-900/30 flex flex-col sm:flex-row items-center justify-between px-6 sm:px-12 gap-3">
        <p>© 2026 Endlessync. Infinite Collaborative Universe. Vercel & Render Synchronized.</p>
        {onOpenBlog && (
          <div className="flex items-center gap-4">
            <button
              onClick={() => onOpenBlog('story')}
              className="text-slate-400 hover:text-white transition cursor-pointer"
            >
              Founder's Story
            </button>
            <span className="text-slate-700">•</span>
            <button
              onClick={() => onOpenBlog('guide')}
              className="text-cyan-400 hover:text-cyan-300 transition underline underline-offset-4 cursor-pointer font-medium"
            >
              Official User Guide →
            </button>
          </div>
        )}
      </footer>
    </div>
  );
}
