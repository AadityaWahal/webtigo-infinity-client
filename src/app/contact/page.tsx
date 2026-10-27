import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Mail, MessageSquare, Globe2, HelpCircle, Send, CheckCircle2, MapPin } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact Us & Support | Endlessync',
  description:
    'Get in touch with the Endlessync (Webtigo Infinity Canvas) team. Inquire about partnerships, technical bug reports, feature requests, or DMCA/content moderation requests.',
  alternates: {
    canonical: 'https://endlessync.vercel.app/contact',
  },
};

export default function ContactPage() {
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
            href="/about"
            className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition"
          >
            About
          </Link>
          <Link
            href="/privacy"
            className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition"
          >
            Privacy
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
        <div className="space-y-10 animate-in fade-in duration-300 text-left">
          {/* Header */}
          <div className="space-y-3 border-b border-slate-800 pb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-semibold text-cyan-300">
              <Mail className="w-3.5 h-3.5 text-cyan-400" />
              <span>Reach the Creators</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
              Contact &amp; Support
            </h1>
            <p className="text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed">
              Have questions regarding real-time canvas integration, moderation requests, advertising inquiries, or technical feedback? We respond promptly to all community inquiries.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Direct Email Card */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Mail className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-white">Direct Email Inquiries</h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                For partnerships, enterprise whiteboards, technical bugs, or removal requests:
              </p>
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <a
                  href="mailto:aadityawahal@gmail.com"
                  className="text-sm font-semibold text-cyan-300 hover:text-cyan-200 underline break-all"
                >
                  aadityawahal@gmail.com
                </a>
                <p className="text-[11px] text-slate-400 mt-1">Average response time: within 24–48 hours</p>
              </div>
            </div>

            {/* Project Origin & Location Card */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <MapPin className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-white">Creator &amp; HQ</h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Endlessync is engineered by Aaditya Wahal, deployed globally across distributed edge networks:
              </p>
              <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-4">
                <li><strong>Creator:</strong> Aaditya Wahal</li>
                <li><strong>Cloud Frontend:</strong> Vercel Global Edge Network</li>
                <li><strong>Real-Time Cluster:</strong> Render High-Velocity WebSocket Node</li>
                <li><strong>Database Layer:</strong> MongoDB Cloud Persistent Engine</li>
              </ul>
            </div>
          </div>

          {/* Quick FAQ / Inquiry Topics */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/40 border border-slate-800 space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-amber-400" />
              Frequently Addressed Inquiries
            </h2>

            <div className="space-y-4 text-xs sm:text-sm text-slate-300">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-1">
                <h3 className="font-semibold text-white">How do I request content removal or report abuse?</h3>
                <p className="text-slate-400">
                  Email us at <a href="mailto:aadityawahal@gmail.com" className="text-cyan-400 underline">aadityawahal@gmail.com</a> with the approximate coordinates (X, Y) and description of the content. Our moderation team clears violating artifacts immediately.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-1">
                <h3 className="font-semibold text-white">Can our school, classroom, or design team use Endlessync?</h3>
                <p className="text-slate-400">
                  Yes! Endlessync is completely free to use with zero registration requirements. Simply open the canvas URL, navigate to your coordinates, and begin collaborating.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-1">
                <h3 className="font-semibold text-white">Where can I read the technical architecture &amp; user manual?</h3>
                <p className="text-slate-400">
                  Visit our dedicated <Link href="/blog?tab=guide" className="text-cyan-400 underline">Official User Guide</Link> or read the <Link href="/blog?tab=story" className="text-cyan-400 underline">Founder&apos;s Story</Link> to discover how the infinite coordinate engine operates.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-800/80 text-center text-xs text-slate-400 backdrop-blur-md bg-slate-900/40">
        <p>© 2026 Endlessync. Infinite Collaborative Universe. All rights reserved.</p>
      </footer>
    </div>
  );
}
