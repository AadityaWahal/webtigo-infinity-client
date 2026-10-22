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
  Zap,
  Globe2,
  ShieldCheck,
  Palette,
  PaintBucket,
  MousePointer2,
  BookOpen,
} from 'lucide-react';

interface LandingPageProps {
  onEnterCanvas: () => void;
  onOpenBlog?: () => void;
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
      <nav className="relative z-20 flex items-center justify-between px-6 sm:px-12 py-6 border-b border-slate-800/60 backdrop-blur-md bg-slate-900/30">
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
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-xs text-emerald-400 font-medium">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>24/7 Global Sync Active</span>
          </div>

          {onOpenBlog && (
            <button
              onClick={onOpenBlog}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 hover:text-white transition cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
              <span>Blog & Guide</span>
            </button>
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

      {/* Main Hero Section */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 sm:px-12 py-16 text-center max-w-5xl mx-auto space-y-12">
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
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
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
              onClick={onOpenBlog}
              className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-200 hover:text-white text-base font-semibold transition cursor-pointer backdrop-blur-xl"
            >
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>Read The Story & Guide</span>
            </button>
          )}
        </div>

        {/* Core Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pt-8 w-full text-left">
          {/* Card 1: Infinite Spatial Coordinates */}
          <div className="p-6 rounded-2xl backdrop-blur-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 transition duration-300 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Spatial Teleportation</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Track your exact (X, Y) world coordinates with live HUD. Teleport directly to any
              coordinate on the infinite grid in seconds.
            </p>
          </div>

          {/* Card 2: 2D Rocket Jet Mode */}
          <div className="p-6 rounded-2xl backdrop-blur-xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/40 transition duration-300 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Rocket className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Rocket Jet Propulsion</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Click and hold to ignite rocket thrusters. Cruise across light-years of canvas at
              Sonic (24x) or Warp (48x) velocity.
            </p>
          </div>

          {/* Card 3: Simulator Hub */}
          <div className="p-6 rounded-2xl backdrop-blur-xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/40 transition duration-300 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Palette className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Simulator Hub</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Radial instrument cluster with 5 satellite tools: custom brush widths, shapes,
              transparency-controlled fill bucket, and Paint eraser.
            </p>
          </div>

          {/* Card 4: Rich Media Ingestion */}
          <div className="p-6 rounded-2xl backdrop-blur-xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 transition duration-300 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Mic className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Voice, Photos & Text</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Drop text notes, record playable voice notes directly into the canvas, and drop photos
              for collaborative visual storytelling.
            </p>
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
          <button
            onClick={onOpenBlog}
            className="text-cyan-400 hover:text-cyan-300 transition underline underline-offset-4 cursor-pointer font-medium"
          >
            Read Story & Guide →
          </button>
        )}
      </footer>
    </div>
  );
}
