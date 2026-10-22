'use client';

import React, { useState } from 'react';
import {
  Rocket,
  Layers,
  ArrowRight,
  BookOpen,
  Calendar,
  Clock,
  Sparkles,
  ArrowLeft,
  Share2,
  Check,
  Compass,
  Cpu,
  Globe2,
  HelpCircle,
  MousePointer,
  Flame,
  Mic,
  PenTool,
} from 'lucide-react';

interface BlogGuideProps {
  onEnterCanvas: () => void;
  onBackToHome?: () => void;
}

export default function BlogGuide({ onEnterCanvas, onBackToHome }: BlogGuideProps) {
  const [activeTab, setActiveTab] = useState<'story' | 'guide'>('story');
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#07090e] text-slate-100 font-sans selection:bg-indigo-500 selection:text-white flex flex-col">
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
          {onBackToHome && (
            <button
              onClick={onBackToHome}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 text-xs font-medium text-slate-300 hover:text-white transition cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Home</span>
            </button>
          )}

          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 shadow-md shadow-indigo-500/20 border border-indigo-400/30">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-white">Endlessync</span>
              <span className="ml-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                Stories & Guides
              </span>
            </div>
          </div>
        </div>

        {/* Tab switch & CTA */}
        <div className="flex items-center gap-3">
          <div className="flex p-1 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('story')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                activeTab === 'story'
                  ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Founder's Story
            </button>
            <button
              onClick={() => setActiveTab('guide')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                activeTab === 'guide'
                  ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Explorer's Guide
            </button>
          </div>

          <button
            onClick={onEnterCanvas}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:brightness-110 active:scale-95 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition cursor-pointer"
          >
            <span>Launch Canvas</span>
            <Rocket className="w-3.5 h-3.5" />
          </button>
        </div>
      </nav>

      {/* Content Container */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-12">
        {activeTab === 'story' ? (
          /* TAB 1: FOUNDER'S OFFICIAL POST (Exact text preserved word-for-word) */
          <article className="space-y-10 animate-in fade-in duration-300">
            {/* Header Meta */}
            <div className="space-y-4 border-b border-slate-800/80 pb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-xs font-semibold text-cyan-300">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Original Release Story</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
                The Midnight Spark Behind Endless Sync
              </h1>

              <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-slate-400 pt-2">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  22nd October 2026
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-slate-500" />
                  4 min read
                </span>
                <span className="flex items-center gap-1.5 text-cyan-400">
                  <Globe2 className="w-4 h-4" />
                  By Creator of Endlessync
                </span>

                <button
                  onClick={handleShare}
                  className="ml-auto flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Link Copied' : 'Share'}</span>
                </button>
              </div>
            </div>

            {/* Post Content with Clean Typography */}
            <div className="space-y-8 text-slate-200 text-base sm:text-lg leading-relaxed">
              <p>
                It was late at night, 3AM, and as many times before I was awake, wasting time and overthinking.
                My mind was buzzing around randomly, as it always does, when one very distinct thought came to me
                that instantly caught my focus: what if the whole world was an infinitely large board?
              </p>

              <p>
                Every site and tool we encounter in daily life is separated into private rooms or accounts.
                Open a digital whiteboard and it's in a private room meant for only you or maybe a tiny team of
                collaborators who came to the workspace through an invite link. Social media is just vertical
                streams of content that go away fast. I wondered what it would be like if there was one open space
                on the web that was infinite - a big old digital whiteboard that anyone could join.
              </p>

              <p className="font-medium text-white">
                So that was the beginning of Endless Sync (Endlessync).
              </p>

              <hr className="border-slate-800 my-8" />

              {/* Subheading 1 */}
              <div className="space-y-4">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                  <span className="w-2 h-7 rounded-full bg-cyan-400 inline-block" />
                  The Idea & the First Version: Weptigo Infinity Canvas
                </h2>

                <p>
                  It's simple to understand. Endlessync is an enormous, infinite canvas that you can scroll in
                  any direction without ever running into an edge. On this page, you can jot down your ideas,
                  illustrate with scribbles, upload pictures, and arrange your thoughts. And the key is that the
                  entire world is on that same page with you at the same time.
                </p>

                <p>
                  We don't do those! If I find that I can say a thing on the website when I'm there and sketch a
                  thing on the website when I'm there, then just someone else who's online on that part of the
                  website can see that thing I just made instantaneously, and can add to it, draw in the same area
                  right near it, redraw over it, or erase parts of it and leave something new. It's like a shared,
                  live, virtual wall!
                </p>

                <p>
                  But Endlessync didn't come out of nowhere. I actually built a version of this website roughly 2
                  years before the current version when I released this, called Weptigo Infinity Canvas. While that
                  predecessor was indexed very well by Google and made a presence in AI searches, it wasn't ideal and
                  had numerous glitches I couldn't fix at the time with the technical limitations of 2-way sync
                  technology. Back then, maintaining 2things on a less-than-great laptop was quite the feat.
                </p>
              </div>

              <hr className="border-slate-800 my-8" />

              {/* Subheading 2 */}
              <div className="space-y-4">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                  <span className="w-2 h-7 rounded-full bg-indigo-500 inline-block" />
                  Rebuilding for Navratri 2026: Sickness, Leaves & Code
                </h2>

                <p>
                  Back then, I was considering making it again during the Navratri 2026 on 15 October. We were unwell
                  those days and the weather was very conducive to the avail. It was raining throughout, and there
                  was no work to do with more leave.
                </p>

                <p>
                  It was a lot of work to build it. A "normal" website is easy by comparison to an infinitely
                  resizeable board that updates live in the browser. The problem with multiple simultaneous
                  drawing, inserting images, and typing is that the system has to process those same updates on the
                  live web page without lag or crashing.
                </p>

                <p>
                  I had to solve was getting it to only load the part of the board you can see on your screen rather
                  than trying to load everything as it would have caused the computer to freeze up. Next was trying
                  to establish the real-time connections so that the second someone moves a file, types a word, or
                  draws a stroke, every other person viewing that part of the board can see that happening as well.
                  There were many bugs and failing test cases where objects would suddenly move backwards or forward
                  or just simply not update or where coordinates would seem to drift. It took many hours of fixing
                  logic, testing the drawing canvas, and speeding up the data transfer time to make it feel right.
                </p>
              </div>

              <hr className="border-slate-800 my-8" />

              {/* Subheading 3 */}
              <div className="space-y-4">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                  <span className="w-2 h-7 rounded-full bg-purple-500 inline-block" />
                  The AI Boom and Support Infrastructure
                </h2>

                <p>
                  Thank goodness things are different than when I first tried. Following the AI boom of the past two
                  years, AI came to my rescue this time around. Thanks to its aid, the site was able to be created
                  exactly as I wanted without all the frustrating hurdles I'd encountered in the past.
                </p>

                <p>
                  I'd like to also give a massive shout out to the platforms that helped with deployment and
                  infrastructure. Render - really I want to live there for their back end and Render for simply
                  providing the service without having to think, I would have struggled to deliver this scaled idea
                  cleanly.
                </p>

                <p>
                  The very best feeling was finally managing to get the real-time sync working smoothly. When I was
                  testing it and I saw the actions pop up on screen in tandem with each other, I knew the idea I'd
                  had at midnight had become a working platform.
                </p>
              </div>

              <hr className="border-slate-800 my-8" />

              {/* Subheading 4 */}
              <div className="space-y-4">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                  <span className="w-2 h-7 rounded-full bg-emerald-400 inline-block" />
                  Live Today & Look Ahead
                </h2>

                <p>
                  I am still in the process of introducing new features to enrich this experience. Now, on 22nd
                  October 2026, it is finally released as Endlessync.
                </p>

                <p>
                  It's a giant open space for anyone to drop in a line or a drawing, post a photo or just see what
                  others are creating around the world. It's designed to be simple, open, and totally collaborative.
                </p>
              </div>

              {/* Bottom interactive card */}
              <div className="mt-12 p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
                <div className="space-y-2 text-left">
                  <h3 className="text-xl font-bold text-white">Experience the Infinite Canvas</h3>
                  <p className="text-xs sm:text-sm text-slate-400">
                    Join this live collective board right now. Draw, explore coordinates, or pin your thoughts.
                  </p>
                </div>
                <button
                  onClick={onEnterCanvas}
                  className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:brightness-110 active:scale-95 text-white text-sm font-bold shadow-xl shadow-indigo-600/30 transition cursor-pointer flex items-center gap-2 shrink-0"
                >
                  <Rocket className="w-4 h-4 text-amber-300" />
                  <span>Enter Endlessync</span>
                </button>
              </div>
            </div>
          </article>
        ) : (
          /* TAB 2: EXPLORER'S USER GUIDE */
          <div className="space-y-10 animate-in fade-in duration-300">
            {/* Guide Header */}
            <div className="space-y-3 border-b border-slate-800/80 pb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-semibold text-cyan-300">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Feature Manual & Shortcuts</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
                Explorer's Guide to Endlessync
              </h1>
              <p className="text-sm sm:text-base text-slate-400">
                Everything you need to master navigation, collaborative sketching, and rich media stamping.
              </p>
            </div>

            {/* Guide Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Feature 1 */}
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Compass className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">Infinite Grid & Teleportation</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  The canvas has no borders. Look at the top-left HUD to track your world (X, Y) coordinates and zoom level.
                  Click the <strong>Teleport</strong> button to instantly jump to any coordinate anywhere in the universe.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Flame className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">2D Rocket Propulsion Mode</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Toggle Rocket Jet Mode at the bottom right. Click and hold the mouse button anywhere to fire thrusters!
                  Cruise across light-years of space smoothly at 10x, 24x, or 48x warp velocities.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <PenTool className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">Simulator Cluster & Brushes</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Click the bottom center pen to expand the radial satellite cluster: choose custom stroke thickness,
                  radiant color palettes, vector shapes (rectangles, circles, arrows, stars), and opacity-controlled fill bucket.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Mic className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">Click-to-Paste Media Hub</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Use the bottom-left (+) hub to add Text Notes, record Voice Notes, or upload Photos.
                  Once recorded or typed, your cursor turns into a plus (+) crosshair stamp: simply click anywhere on the canvas to place it!
                </p>
              </div>
            </div>

            {/* Quick Keyboard Shortcuts Table */}
            <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-cyan-400" />
                <span>Controls & Shortcuts</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                  <span className="text-slate-400">Pan Viewport</span>
                  <span className="font-mono text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">Drag Canvas</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                  <span className="text-slate-400">Zoom In / Out</span>
                  <span className="font-mono text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">Mouse Wheel</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                  <span className="text-slate-400">Cancel Placement / Close Menus</span>
                  <span className="font-mono text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">ESC Key</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                  <span className="text-slate-400">Rocket Thrusters</span>
                  <span className="font-mono text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">Click & Hold</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-800/80 text-center text-xs text-slate-400 backdrop-blur-md bg-slate-900/40">
        <p>© 2026 Endlessync. Infinite Collaborative Universe. Vercel & Render Synchronized.</p>
      </footer>
    </div>
  );
}
