import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, FileText, CheckCircle2, AlertTriangle, Scale, Shield, Users } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service | Endlessync',
  description:
    'Review the Terms of Service for using Endlessync (Endless Sync / Webtigo Infinity Canvas), governing global real-time collaboration, user conduct, intellectual property, and community guidelines.',
  alternates: {
    canonical: 'https://endlessync.vercel.app/terms',
  },
};

export default function TermsOfServicePage() {
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
            href="/privacy"
            className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition"
          >
            Privacy Policy
          </Link>
          <Link
            href="/contact"
            className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition"
          >
            Contact
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
        <article className="space-y-8 animate-in fade-in duration-300 text-left">
          {/* Header */}
          <div className="space-y-3 border-b border-slate-800 pb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-xs font-semibold text-indigo-300">
              <Scale className="w-3.5 h-3.5 text-indigo-400" />
              <span>User Agreement &amp; Rules</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
              Terms of Service
            </h1>
            <p className="text-sm text-slate-400">
              Last Updated: October 28, 2026 • Effective Date: October 22, 2026
            </p>
          </div>

          <div className="space-y-8 text-slate-300 text-sm sm:text-base leading-relaxed">
            <p>
              These Terms of Service (&quot;Terms&quot;) constitute a legally binding agreement between you and <strong>Endlessync</strong> (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) regarding your access to and use of <Link href="https://endlessync.vercel.app" className="text-cyan-400 hover:underline">https://endlessync.vercel.app</Link> and all associated real-time collaborative services.
            </p>

            {/* Section 1 */}
            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                1. Acceptance of Terms
              </h2>
              <p>
                By opening, browsing, sketching on, or interacting with Endlessync in any manner, you signify that you have read, understood, and agreed to be bound by these Terms of Service and our Privacy Policy. If you do not agree to all provisions, you must discontinue use of the platform immediately.
              </p>
            </section>

            {/* Section 2 */}
            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-400" />
                2. Nature of the Service &amp; Community Etiquette
              </h2>
              <p>
                Endlessync provides an infinite, open 2D digital canvas featuring real-time multiplayer stroke rendering, audio/photo pins, and embedded board games. Because the coordinate plane is shared collectively among all users globally:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-slate-300">
                <li>You acknowledge that content you submit is immediately accessible to any participant viewing that region of the board.</li>
                <li>You agree not to intentionally overwrite, vandalize, or cover other creators&apos; drawings with massive blank blocks or abusive imagery.</li>
                <li>Respect the shared origin coordinate sector (0, 0) as a public communal landmark.</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
                3. Prohibited Content &amp; Conduct
              </h2>
              <div className="p-5 rounded-2xl bg-rose-950/20 border border-rose-500/30 text-rose-200 space-y-2">
                <p className="font-semibold">You strictly agree NOT to upload, post, sketch, or transmit any content that:</p>
                <ul className="list-disc pl-5 space-y-1 text-sm text-rose-200/90">
                  <li>Is unlawful, harmful, threatening, abusive, harassing, defamatory, vulgar, or hate-promoting.</li>
                  <li>Contains explicit sexual content, violence, or exploitation of minors.</li>
                  <li>Infringes any patent, trademark, trade secret, copyright, or other proprietary rights.</li>
                  <li>Contains malware, computer viruses, spam, or automated bot scripts targeting WebSocket nodes.</li>
                  <li>Discloses confidential personal information, credit card numbers, or passwords.</li>
                </ul>
              </div>
            </section>

            {/* Section 4 */}
            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-400" />
                4. Intellectual Property
              </h2>
              <p>
                You retain ownership of the original intellectual property rights in drawings and creative materials you introduce to the canvas. However, by broadcasting content to the public canvas, you grant Endlessync a worldwide, royalty-free, perpetual license to host, display, cache, reproduce, and transmit such content solely to operate and showcase the collaborative service.
              </p>
              <p>
                The Endlessync brand name, emblem, code architecture, 2D game engines, UI styling, and algorithms are the proprietary property of Endlessync and its creator, protected by international copyright laws.
              </p>
            </section>

            {/* Section 5 */}
            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                5. Disclaimer of Warranties &amp; Limitation of Liability
              </h2>
              <p>
                Endlessync is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis without warranties of any kind, whether express or implied. While we employ high-reliability cloud servers and persistence, we do not warrant that service will be uninterrupted, error-free, or completely immune to network packet drops or browser crashes. In no event shall Endlessync or its contributors be liable for indirect, incidental, or consequential damages resulting from your use of the service.
              </p>
            </section>

            {/* Section 6 */}
            <section className="space-y-3 border-t border-slate-800 pt-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                6. Modifications &amp; Inquiries
              </h2>
              <p>
                We reserve the right to revise these Terms at any time. Continued use of Endlessync after revisions are posted indicates your acceptance. For questions regarding our Terms, please contact <a href="mailto:aadityawahal@gmail.com" className="text-cyan-400 underline">aadityawahal@gmail.com</a>.
              </p>
            </section>
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
