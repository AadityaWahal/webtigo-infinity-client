'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  Calendar,
  Clock,
  ChevronDown,
  Terminal,
  MessageSquare,
  FileText,
  Share2,
  Check,
} from 'lucide-react';

interface LandingPageProps {
  onEnterCanvas?: () => void;
  onOpenBlog?: (tab?: 'story' | 'guide') => void;
}

export default function LandingPage({ onEnterCanvas, onOpenBlog }: LandingPageProps) {
  const router = useRouter();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleEnterCanvas = () => {
    if (onEnterCanvas) {
      onEnterCanvas();
    } else {
      router.push('/canvas');
    }
  };

  const handleOpenBlog = (tab: 'story' | 'guide' = 'story') => {
    if (onOpenBlog) {
      onOpenBlog(tab);
    } else {
      router.push(`/blog?tab=${tab}`);
    }
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.origin);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#07090e] text-slate-100 font-sans selection:bg-indigo-500 selection:text-white flex flex-col">
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
          <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-slate-900 border border-cyan-500/30 overflow-hidden shadow-lg shadow-cyan-500/20 p-1">
            <img
              src="/media/endlessync-symbol.png"
              alt="Endlessync Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-white flex items-center">
                Endless<span className="text-cyan-400">ync</span>
              </span>
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

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleOpenBlog('story')}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 hover:text-white transition cursor-pointer"
            >
              <span>Founder's Story</span>
            </button>
            <button
              onClick={() => handleOpenBlog('guide')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-cyan-300 hover:text-white transition cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
              <span>User Guide</span>
            </button>
          </div>

          <button
            onClick={handleEnterCanvas}
            className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:brightness-110 active:scale-95 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition cursor-pointer"
          >
            <span>Launch Canvas</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 sm:px-12 py-16 text-center max-w-5xl mx-auto space-y-20">
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
            <strong>Endlessync</strong> (also known as <em>Endless Sync</em> and formerly <em>Webtigo Infinity Canvas</em>)
            is a persistent, boundary-free collaborative digital universe. Navigate at warp speed with
            2D rocket propulsion, sketch ideas with transparency-controlled vector brushes, and pin
            voice notes, text, and photos anywhere in infinite Cartesian space.
          </p>
        </div>

        {/* Central Prominent CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={handleEnterCanvas}
            className="group relative flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:shadow-[0_0_40px_rgba(99,102,241,0.6)] active:scale-95 text-white text-base font-bold shadow-2xl transition duration-300 cursor-pointer border border-indigo-400/40"
          >
            <Rocket className="w-5 h-5 text-amber-300 group-hover:rotate-12 transition-transform duration-300" />
            <span>Enter Endlessync</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            <span className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-600 opacity-20 group-hover:opacity-60 blur-lg transition duration-300 -z-10" />
          </button>

          <button
            onClick={() => handleOpenBlog('guide')}
            className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-200 hover:text-white text-base font-semibold transition cursor-pointer backdrop-blur-xl"
          >
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <span>Explore User Guide</span>
          </button>
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
                <em> Webtigo Infinity Canvas</em>, it has been reborn with high-velocity real-time WebSockets and AI acceleration.
              </p>
            </div>

            <button
              onClick={() => handleOpenBlog('story')}
              className="shrink-0 flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-cyan-300 hover:text-white text-xs font-semibold transition cursor-pointer"
            >
              <span>Read Full Founder's Story</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* --------------------------------------------------------- */}
        {/* FRONT-END TOOLS & CONTROLS GUIDE (Tailored & Visual)      */}
        {/* --------------------------------------------------------- */}
        <section className="w-full space-y-8 text-left">
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

            <button
              onClick={() => handleOpenBlog('guide')}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 transition cursor-pointer"
            >
              <span>Read Complete In-Depth Guide</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
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
        </section>

        {/* --------------------------------------------------------- */}
        {/* COMPREHENSIVE ON-PAGE EDITORIAL & BLOG ARTICLES (AdSense) */}
        {/* --------------------------------------------------------- */}
        <section className="w-full space-y-12 text-left pt-6">
          <div className="border-b border-slate-800 pb-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-semibold text-cyan-300 mb-3">
              <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
              <span>Endlessync Knowledge Base & Official Publications</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Deep Dives, Stories & Engineering Behind Endlessync
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-2xl leading-relaxed">
              Explore the design philosophy, technical architecture, and vision powering the world's largest
              open-access collaborative infinite canvas. Written for creators, software engineers, and digital explorers.
            </p>
          </div>

          <div className="space-y-10">
            {/* Article 1: The Midnight Spark Behind Endlessync */}
            <article className="p-8 sm:p-10 rounded-3xl bg-slate-900/40 border border-slate-800 hover:border-slate-700/80 transition duration-300 space-y-6">
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                <span className="px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-semibold">
                  Founder's Story
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  October 2026
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  8 min read
                </span>
                <span>•</span>
                <span className="text-slate-300 font-medium">By Aaditya Wahal</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-white hover:text-cyan-300 transition">
                The Midnight Spark Behind Endlessync (Webtigo Infinity Canvas)
              </h3>

              <div className="text-xs sm:text-sm text-slate-300 space-y-4 leading-relaxed">
                <p>
                  It was late at night, 3 AM, and as many times before I was awake, wasting time and overthinking.
                  My mind was buzzing around randomly, as it always does, when one very distinct thought came to me
                  that instantly caught my focus: <strong>what if the whole world was an infinitely large board?</strong>
                </p>
                <p>
                  Every site and tool we encounter in daily life is separated into private rooms or accounts.
                  Open a digital whiteboard and it's in a private room meant for only you or maybe a tiny team
                  of collaborators who came to the workspace through an invite link. Social media is just vertical
                  streams of content that go away fast. I wondered what it would be like if there was one open space
                  on the web that was infinite — a big old digital whiteboard that anyone could join.
                </p>
                <p>
                  So that was the beginning of <strong>Endless Sync (Endlessync)</strong>. The idea is simple to understand:
                  an enormous, infinite canvas that you can scroll in any direction, forever. No boundaries, no borders,
                  no resets. If you draw something at coordinates <code className="text-cyan-300 bg-slate-800 px-1 py-0.5 rounded">(1500, 3200)</code>,
                  it stays there. Someone from halfway across the world can scroll past it months later, see your work,
                  and draw something right next to it.
                </p>
                <p>
                  The first version was called <strong>Webtigo Infinity Canvas</strong>. It was a rough prototype made with
                  vanilla JavaScript and a small server. It worked, but it was slow and when ten people drew at once, the lines
                  lagged. Realizing the scale of this vision required rebuilding the engine from the ground up: zero-latency
                  WebSockets, 2D rocket thrusters to traverse millions of pixels, and a protected origin sanctuary at
                  <code className="text-cyan-300 bg-slate-800 px-1 py-0.5 rounded">(0, 0)</code> so the heart of the world remains preserved.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-800/80">
                <button
                  onClick={() => handleOpenBlog('story')}
                  className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 transition cursor-pointer"
                >
                  <span>Read Full Original Founder's Post</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleShare}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition cursor-pointer"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copied URL!' : 'Share Article'}</span>
                </button>
              </div>
            </article>

            {/* Article 2: The Engineering of an Infinite Cartesian Universe */}
            <article className="p-8 sm:p-10 rounded-3xl bg-slate-900/40 border border-slate-800 hover:border-slate-700/80 transition duration-300 space-y-6">
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-semibold">
                  Engineering Deep Dive
                </span>
                <span className="flex items-center gap-1">
                  <Terminal className="w-3.5 h-3.5 text-slate-500" />
                  Systems Architecture
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  6 min read
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-white hover:text-cyan-300 transition">
                The Architecture of an Infinite Cartesian Whiteboard
              </h3>

              <div className="text-xs sm:text-sm text-slate-300 space-y-4 leading-relaxed">
                <p>
                  Building an unbounded 2D canvas poses unique mathematical and network challenges that conventional
                  document-based apps never face. Traditional web apps render elements into finite pixel containers with
                  fixed aspect ratios. Endlessync, by contrast, operates on an unconstrained Cartesian coordinate system
                  where coordinates span from <code className="text-cyan-300 bg-slate-800 px-1 py-0.5 rounded">-Infinity</code> to{' '}
                  <code className="text-cyan-300 bg-slate-800 px-1 py-0.5 rounded">+Infinity</code>.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-3">
                  <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-1.5">
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-cyan-400" /> Coordinate Transformation
                    </h4>
                    <p className="text-xs text-slate-300 leading-normal">
                      Viewport mapping transforms screen coordinates to world coordinates via{' '}
                      <code className="text-[11px] text-cyan-300">worldX = (screenX - panOffset.x) / zoom</code>.
                      This maintains mathematical precision regardless of window resize or zoom level.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-1.5">
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Radio className="w-3.5 h-3.5 text-emerald-400" /> Real-Time Sync Pipeline
                    </h4>
                    <p className="text-xs text-slate-300 leading-normal">
                      Full-duplex WebSocket connections broadcast point deltas in real-time, accompanied by
                      automated ping/pong heartbeats to keep render nodes and client sessions persistent 24/7.
                    </p>
                  </div>
                </div>
                <p>
                  To protect against griefing and accidental wiping, two crucial architectural pillars were engineered:
                  the permanent elimination of a global "Clear All" button, and the <strong>Origin Sanctuary</strong>.
                  The Sanctuary reserves a 280-pixel radial zone centered at <code className="text-rose-400 bg-slate-800 px-1 py-0.5 rounded">(0, 0)</code>,
                  rendering the glowing Endlessync centerpiece untouchable while granting the rest of the universe complete creative freedom.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-800/80">
                <button
                  onClick={() => handleOpenBlog('guide')}
                  className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 transition cursor-pointer"
                >
                  <span>Explore Technical Documentation</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </article>

            {/* Article 3: Spatial Collaboration & Audio Notes */}
            <article className="p-8 sm:p-10 rounded-3xl bg-slate-900/40 border border-slate-800 hover:border-slate-700/80 transition duration-300 space-y-6">
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                <span className="px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 font-semibold">
                  Spatial Productivity
                </span>
                <span className="flex items-center gap-1">
                  <Mic className="w-3.5 h-3.5 text-slate-500" />
                  Multimedia Innovation
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  5 min read
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-white hover:text-cyan-300 transition">
                Spatial Memory: Why Unbounded Canvases Beat Folder Trees
              </h3>

              <div className="text-xs sm:text-sm text-slate-300 space-y-4 leading-relaxed">
                <p>
                  Human cognition evolved to recall locations spatially. In traditional operating systems and productivity tools,
                  knowledge is buried inside hierarchical nested folders, tabs, and channels where ideas go to die.
                  On an infinite whiteboard, concepts occupy dedicated spatial territories.
                </p>
                <p>
                  Endlessync introduces the <strong>Spatial Media Hub</strong>, allowing creators to anchor rich text sticky cards,
                  photographs, and microphone voice notes directly into coordinate space. Whether leaving a spontaneous voice memo
                  explaining a diagram at <code className="text-indigo-300 bg-slate-800 px-1 py-0.5 rounded">(4500, -820)</code>, or
                  pinning research screenshots next to an architectural flowchart, every element retains its persistent geographic place in the universe.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-800/80">
                <button
                  onClick={handleEnterCanvas}
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 transition cursor-pointer"
                >
                  <span>Test Spatial Pinning on Canvas</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </article>
          </div>
        </section>

        {/* --------------------------------------------------------- */}
        {/* INTERACTIVE FREQUENTLY ASKED QUESTIONS (FAQ)              */}
        {/* --------------------------------------------------------- */}
        <section className="w-full space-y-8 text-left pt-6">
          <div className="border-b border-slate-800 pb-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs font-semibold text-amber-300 mb-3">
              <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Got Questions?</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Frequently Asked Questions (FAQ)
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Everything you need to know about navigating, collaborating, and creating on Endlessync.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "What is Endlessync (formerly Webtigo Infinity Canvas)?",
                a: "Endlessync is a persistent, boundary-free collaborative digital whiteboard. Unlike conventional tools that force you into isolated private rooms, Endlessync hosts a single shared Cartesian universe where anyone across the world can sketch, brainstorm, pin audio notes, and explore simultaneously in real time."
              },
              {
                q: "How does navigation across the infinite plane work?",
                a: "You can pan freely by selecting the Hand/Pan tool or by holding the Spacebar and dragging anywhere on the canvas. To cover massive distances, toggle Rocket Mode to cruise at 10x, 24x, or 48x warp velocities. The top-left HUD displays your live (X, Y) coordinates and provides an instant Teleport input."
              },
              {
                q: "Can anyone erase or clear the entire canvas?",
                a: "No. In Endlessync, there is no global 'Clear All' button. This ensures that no individual can maliciously wipe the hard work of contributors worldwide. Erasers function like precision paint erasers that only shave touched strokes, and the Origin Sanctuary preserves the center emblem."
              },
              {
                q: "What is the Protected Origin Sanctuary at (0, 0)?",
                a: "The Origin Sanctuary is a circular protected zone with a 280-pixel radius centered at (0, 0). It houses the glowing Endlessync emblem centerpiece. Drawing or placing media inside this sanctuary is prevented by the engine to ensure the world's origin remains an immutable landmark for navigation."
              },
              {
                q: "How do voice notes and text cards work?",
                a: "Open the bottom-left Media Hub (+) and choose either Text Note or Audio Note. For audio notes, speak into your microphone to record a quick thought. Once confirmed, a crosshair stamp cursor appears: simply click anywhere on the infinite canvas to anchor your note spatially for anyone to discover."
              },
              {
                q: "Is Endlessync free to use, and do I need to register?",
                a: "Endlessync is 100% free and open to everyone worldwide. No account registration, password, or login is required. You can jump directly into the workspace, collaborate with teammates, or leave your digital mark in seconds."
              }
            ].map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-slate-900/50 border border-slate-800/80 overflow-hidden transition"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 text-sm font-semibold text-white hover:text-cyan-300 transition cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                      activeFaq === idx ? 'rotate-180 text-cyan-400' : ''
                    }`}
                  />
                </button>
                {activeFaq === idx && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/50 animate-fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

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
            onClick={handleEnterCanvas}
            className="shrink-0 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-semibold transition cursor-pointer flex items-center gap-2"
          >
            <span>Launch Workbench</span>
            <ArrowRight className="w-4 h-4 text-cyan-400" />
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-20 py-8 border-t border-slate-800/60 text-center text-xs text-slate-400 backdrop-blur-md bg-slate-900/30 flex flex-col sm:flex-row items-center justify-between px-6 sm:px-12 gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-left">
          <div className="flex items-center gap-2">
            <img src="/media/endlessync-symbol.png" alt="Emblem" className="w-4 h-4 object-contain" />
            <span className="font-bold text-white">Endlessync</span>
          </div>
          <p>© 2026 Endlessync. Infinite Collaborative Universe. Vercel & Render Synchronized.</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => handleOpenBlog('story')}
            className="text-slate-400 hover:text-white transition cursor-pointer"
          >
            Founder's Story
          </button>
          <span className="text-slate-700">•</span>
          <button
            onClick={() => handleOpenBlog('guide')}
            className="text-cyan-400 hover:text-cyan-300 transition underline underline-offset-4 cursor-pointer font-medium"
          >
            Official User Guide →
          </button>
          <span className="text-slate-700">•</span>
          <button
            onClick={handleEnterCanvas}
            className="text-slate-300 hover:text-white transition cursor-pointer font-medium"
          >
            Launch Canvas
          </button>
        </div>
      </footer>
    </div>
  );
}
