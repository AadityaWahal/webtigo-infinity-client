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
  Globe2,
  PenTool,
  Type,
  ImageIcon,
  Users,
  MousePointer,
  HelpCircle,
  Flame,
  ShieldCheck,
  Layers as LayersIcon,
  Eraser,
} from 'lucide-react';

interface BlogGuideProps {
  initialTab?: 'story' | 'guide';
  onEnterCanvas: () => void;
  onBackToHome?: () => void;
}

export default function BlogGuide({
  initialTab = 'story',
  onEnterCanvas,
  onBackToHome,
}: BlogGuideProps) {
  const [activeTab, setActiveTab] = useState<'story' | 'guide'>(initialTab);
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
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-slate-900 border border-cyan-500/30 overflow-hidden shadow-md shadow-cyan-500/20 p-1">
              <img
                src="/media/endlessync-symbol.png"
                alt="Endlessync Emblem"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-white flex items-center">
                Endless<span className="text-cyan-400">ync</span>
              </span>
              <span className="ml-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                Stories & Docs
              </span>
            </div>
          </div>
        </div>

        {/* Tab Switcher & CTA */}
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
              Official User Guide
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

      {/* Main Container */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-12">
        {/* ========================================================= */}
        {/* TAB 1: FOUNDER'S STORY (Exact text preserved word-for-word) */}
        {/* ========================================================= */}
        {activeTab === 'story' && (
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
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-slate-400" />}
                  <span>{copied ? 'Link Copied' : 'Share'}</span>
                </button>
              </div>
            </div>

            {/* Post Content */}
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

              {/* Bottom Navigation CTA */}
              <div className="mt-12 p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
                <div className="space-y-1 text-left">
                  <h3 className="text-xl font-bold text-white">Ready to dive in?</h3>
                  <p className="text-xs sm:text-sm text-slate-400">
                    Switch over to the User Guide to learn the controls, or jump straight into the canvas.
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => setActiveTab('guide')}
                    className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-white transition cursor-pointer"
                  >
                    View User Guide →
                  </button>
                  <button
                    onClick={onEnterCanvas}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:brightness-110 active:scale-95 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition cursor-pointer flex items-center gap-2"
                  >
                    <Rocket className="w-3.5 h-3.5 text-amber-300" />
                    <span>Launch Canvas</span>
                  </button>
                </div>
              </div>
            </div>
          </article>
        )}

        {/* ========================================================= */}
        {/* TAB 2: OFFICIAL USER GUIDE (Exact text preserved word-for-word) */}
        {/* ========================================================= */}
        {activeTab === 'guide' && (
          <article className="space-y-10 animate-in fade-in duration-300">
            {/* Header Meta */}
            <div className="space-y-4 border-b border-slate-800/80 pb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-semibold text-cyan-300">
                <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                <span>Official Documentation</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
                The User Guide to Endlessync (Webtigo Infinity Canvas)
              </h1>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
                Endlessync is designed as a persistent, boundary-free canvas where actions sync live across all connected
                participants worldwide. Because every user interacts with the exact same coordinate plane without isolated
                rooms or locks, understanding how to navigate, manipulate elements, and collaborate smoothly is essential.
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-2">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  Updated October 2026
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-slate-500" />
                  6 min read
                </span>
                <button
                  onClick={handleShare}
                  className="ml-auto flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-slate-400" />}
                  <span>{copied ? 'Link Copied' : 'Share Guide'}</span>
                </button>
              </div>
            </div>

            {/* Guide Body */}
            <div className="space-y-12 text-slate-200 text-base sm:text-lg leading-relaxed">
              {/* 1. Infinite Navigation & Viewport Management */}
              <section className="space-y-5">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                  <span className="w-2 h-7 rounded-full bg-cyan-400 inline-block" />
                  1. Infinite Navigation & Viewport Management
                </h2>
                <p>
                  The infinite workspace does not bind you to standard page borders. Instead, you move across a virtual
                  Cartesian coordinate system using panning and zooming.
                </p>

                <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Compass className="w-5 h-5 text-cyan-400" />
                    Panning (Moving Across the World)
                  </h3>
                  <ul className="space-y-3 text-sm text-slate-300 list-disc pl-5">
                    <li>
                      <strong>Hand / Pan Mode:</strong> Select the Pan tool from the toolbar (or hold down the Spacebar)
                      and click-and-drag anywhere on the canvas.
                    </li>
                    <li>
                      <strong>Trackpad & Mouse:</strong> Two-finger drag on trackpads or clicking and dragging with the
                      middle mouse button allows smooth movement across the board.
                    </li>
                    <li>
                      <strong>Coordinate Awareness:</strong> As you move away from the origin (0, 0), your viewport
                      dynamically updates to load only the elements within your active field of view to maintain high performance.
                    </li>
                  </ul>
                </div>

                <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <MousePointer className="w-5 h-5 text-indigo-400" />
                    Zooming & Scaling
                  </h3>
                  <ul className="space-y-3 text-sm text-slate-300 list-disc pl-5">
                    <li>
                      <strong>Mouse Wheel / Pinch-to-Zoom:</strong> Scroll up to zoom in for detailed sketches or text
                      alignment, and scroll down to zoom out for a high-level overview of regional activity.
                    </li>
                    <li>
                      <strong>Minimap & Origin Reset:</strong> If you lose track of your creations in the endless space,
                      use the reset button or minimap control to re-center your viewport back to the origin coordinates (0, 0).
                    </li>
                  </ul>
                </div>
              </section>

              <hr className="border-slate-800 my-8" />

              {/* 2. Real-Time Freehand Drawing & Sketching */}
              <section className="space-y-5">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                  <span className="w-2 h-7 rounded-full bg-indigo-500 inline-block" />
                  2. Real-Time Freehand Drawing & Sketching
                </h2>
                <p>
                  The drawing engine broadcasts vector stroke data live, ensuring precision while keeping network bandwidth low.
                </p>

                <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <PenTool className="w-5 h-5 text-indigo-400" />
                    Choosing Tools & Stroke Properties
                  </h3>
                  <ul className="space-y-3 text-sm text-slate-300 list-disc pl-5">
                    <li>
                      <strong>Pen Tool:</strong> Activate the brush/pen icon from the main tool rail to begin drawing freehand strokes.
                    </li>
                    <li>
                      <strong>Color Palette:</strong> Select from predefined swatches or open the color picker to change your stroke color.
                    </li>
                    <li>
                      <strong>Stroke Width:</strong> Adjust the slider to switch between fine line annotations (1–3px) and broad markers or graffiti tags (8–20px).
                    </li>
                  </ul>
                </div>

                <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Eraser className="w-5 h-5 text-rose-400" />
                    Eraser & Corrections
                  </h3>
                  <ul className="space-y-3 text-sm text-slate-300 list-disc pl-5">
                    <li>
                      <strong>Object vs. Pixel Erasing:</strong> The eraser tool allows you to remove entire stroke paths or target specific lines drawn by you or others.
                    </li>
                    <li>
                      <strong>Undo / Redo:</strong> Use standard shortcuts (Ctrl+Z / Cmd+Z and Ctrl+Y / Cmd+Shift+Z) for local action history before strokes are committed permanently to the database layer.
                    </li>
                  </ul>
                </div>
              </section>

              <hr className="border-slate-800 my-8" />

              {/* 3. Dynamic Text & Thought Placement */}
              <section className="space-y-5">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                  <span className="w-2 h-7 rounded-full bg-purple-500 inline-block" />
                  3. Dynamic Text & Thought Placement
                </h2>
                <p>
                  Text tools are built for leaving comments, brainstorming, or writing persistent notes directly on the board.
                </p>

                <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Type className="w-5 h-5 text-purple-400" />
                    Creating Text Blocks
                  </h3>
                  <ol className="space-y-2 text-sm text-slate-300 list-decimal pl-5">
                    <li>Click the <strong>Text Tool</strong> (T) from the toolbar.</li>
                    <li>Click anywhere on the open canvas where you want your text to anchor.</li>
                    <li>Type directly into the inline editor.</li>
                  </ol>
                </div>

                <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                  <h3 className="text-lg font-bold text-white">Formatting & Resizing</h3>
                  <ul className="space-y-3 text-sm text-slate-300 list-disc pl-5">
                    <li>
                      <strong>Font Sizing:</strong> Adjust the scale using the contextual floating menu to make header-sized announcements or fine-print annotations.
                    </li>
                    <li>
                      <strong>Color & Alignment:</strong> Align text left, center, or right, and modify font colors to stand out against background doodles or dark sections.
                    </li>
                    <li>
                      <strong>Live Broadcast:</strong> As soon as you complete or commit a text block, it becomes readable in real time to any user viewing that sector of the board.
                    </li>
                  </ul>
                </div>
              </section>

              <hr className="border-slate-800 my-8" />

              {/* 4. Image Uploads & Media Placement */}
              <section className="space-y-5">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                  <span className="w-2 h-7 rounded-full bg-emerald-400 inline-block" />
                  4. Image Uploads & Media Placement
                </h2>
                <p>
                  Endlessync allows you to anchor external images and graphics onto the shared canvas.
                </p>

                <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-emerald-400" />
                    Uploading Assets
                  </h3>
                  <ul className="space-y-3 text-sm text-slate-300 list-disc pl-5">
                    <li>
                      <strong>File Upload Button:</strong> Click the media/image icon to select supported image formats (.png, .jpg, .jpeg, .webp, .svg) directly from your device.
                    </li>
                    <li>
                      <strong>Drag-and-Drop:</strong> Drag an image file from your desktop directly onto the browser window; the image will automatically place itself at your cursor’s canvas coordinates.
                    </li>
                    <li>
                      <strong>Clipboard Paste:</strong> Copy an image to your clipboard and press Ctrl+V (or Cmd+V) while focusing on the board to drop it instantly into the view.
                    </li>
                  </ul>
                </div>

                <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                  <h3 className="text-lg font-bold text-white">Transforming Images</h3>
                  <ul className="space-y-3 text-sm text-slate-300 list-disc pl-5">
                    <li>
                      <strong>Moving:</strong> Click and drag the image across the board to re-position it.
                    </li>
                    <li>
                      <strong>Rescaling:</strong> Select an image to activate bounding corner anchors. Drag any corner handle inward or outward to scale the graphic while maintaining aspect ratio.
                    </li>
                    <li>
                      <strong>Layering & Overlap:</strong> Images act as layered objects, allowing other users to sketch notes over them or frame them with drawings.
                    </li>
                  </ul>
                </div>
              </section>

              <hr className="border-slate-800 my-8" />

              {/* 5. Global Real-Time Collaboration & Etiquette */}
              <section className="space-y-5">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                  <span className="w-2 h-7 rounded-full bg-amber-400 inline-block" />
                  5. Global Real-Time Collaboration & Etiquette
                </h2>
                <p>
                  Because Endlessync is completely open with no private rooms, passwords, or locks, the board is an ever-shifting public mural.
                </p>

                <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                  <ul className="space-y-4 text-sm text-slate-300 list-disc pl-5">
                    <li>
                      <strong>Live Presence:</strong> When other participants are working within your visible screen area, updates appear instantly as they are committed.
                    </li>
                    <li>
                      <strong>Collaborative Layering:</strong> You can expand on existing ideas by adding notes adjacent to other sketches, building collective mind maps, or answering questions left by users on different continents.
                    </li>
                    <li>
                      <strong>Shared Space Etiquette:</strong> Remember that anyone can pan to your location, read your notes, or modify nearby space. Avoid placing oversized images over smaller collaborative sketches, and treat the canvas as a continuously evolving public commons.
                    </li>
                  </ul>
                </div>
              </section>

              {/* Bottom Launch Card */}
              <div className="mt-12 p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
                <div className="space-y-1 text-left">
                  <h3 className="text-xl font-bold text-white">Master the Universe</h3>
                  <p className="text-xs sm:text-sm text-slate-400">
                    Apply these techniques live on the infinite grid. Your drawings are preserved 24/7.
                  </p>
                </div>
                <button
                  onClick={onEnterCanvas}
                  className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:brightness-110 active:scale-95 text-white text-sm font-bold shadow-xl shadow-indigo-600/30 transition cursor-pointer flex items-center gap-2 shrink-0"
                >
                  <Rocket className="w-4 h-4 text-amber-300" />
                  <span>Launch Canvas</span>
                </button>
              </div>
            </div>
          </article>
        )}
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-800/80 text-center text-xs text-slate-400 backdrop-blur-md bg-slate-900/40">
        <p>© 2026 Endlessync. Infinite Collaborative Universe. Vercel & Render Synchronized.</p>
      </footer>
    </div>
  );
}
