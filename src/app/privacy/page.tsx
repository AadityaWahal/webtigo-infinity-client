import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Lock, Eye, Database, Cookie, Mail, CheckCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy | Endlessync',
  description:
    'Read the official Privacy Policy for Endlessync (Webtigo Infinity Canvas). Learn how we handle real-time sync data, public collaborative canvas inputs, cookies, and user privacy in full compliance with global standards.',
  alternates: {
    canonical: 'https://endlessync.vercel.app/privacy',
  },
};

export default function PrivacyPolicyPage() {
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
            href="/terms"
            className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition"
          >
            Terms of Service
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-semibold text-cyan-300">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Official Policy Document</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
              Privacy Policy
            </h1>
            <p className="text-sm text-slate-400">
              Last Updated: October 28, 2026 • Effective Date: October 22, 2026
            </p>
          </div>

          <div className="space-y-8 text-slate-300 text-sm sm:text-base leading-relaxed">
            <p>
              Welcome to <strong>Endlessync</strong> (also referred to as &quot;Endless Sync&quot;, &quot;Webtigo Infinity Canvas&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;), hosted at <Link href="https://endlessync.vercel.app" className="text-cyan-400 hover:underline">https://endlessync.vercel.app</Link>.
              We respect your privacy and are committed to protecting it through transparent policies. This Privacy Policy describes how we collect, store, protect, and handle data when you use our boundless real-time collaborative digital canvas.
            </p>

            {/* Section 1 */}
            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-cyan-400" />
                1. Information We Collect
              </h2>
              <p>
                Because Endlessync is engineered as an open, frictionless collaborative space without mandatory registration barriers, we collect minimal information necessary to deliver high-performance real-time canvas synchronization:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-slate-300">
                <li>
                  <strong>Public Canvas Contributions:</strong> Vector stroke paths, coordinate anchors (X, Y), dynamic text blocks, audio voice recordings placed on the board, uploaded image representations, and 2D board game move states. Everything submitted to the canvas coordinate plane is publicly viewable and broadcast in real time to connected participants worldwide.
                </li>
                <li>
                  <strong>Real-Time Session Telemetry:</strong> Ephemeral WebSocket identifiers and cursor coordinates (X, Y) that broadcast to active participants within your field of view. Ephemeral cursor locations are not permanently recorded.
                </li>
                <li>
                  <strong>Device &amp; Browser Telemetry:</strong> Standard, non-personally identifiable log information including browser type, operating system, language preferences, approximate geographic region (country or city level), screen resolution, and page referrer headers.
                </li>
              </ul>
            </section>

            {/* Section 2 */}
            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                <Eye className="w-5 h-5 text-indigo-400" />
                2. Nature of the Public Infinite Canvas
              </h2>
              <div className="p-5 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 text-indigo-200">
                <p>
                  <strong>Important Notice:</strong> Endlessync does not feature private password-protected rooms or access gates. Any line drawn, text message typed, image uploaded, or game started is permanently visible on the open shared world. <strong>Please do not post confidential personal credentials, passwords, financial information, government IDs, or sensitive personal data on the canvas.</strong>
                </p>
              </div>
            </section>

            {/* Section 3 */}
            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                <Cookie className="w-5 h-5 text-amber-400" />
                3. Cookies, Local Storage &amp; Third-Party Services
              </h2>
              <p>
                We prioritize user privacy and minimize tracker usage:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-slate-300">
                <li>
                  <strong>Local Storage Preferences:</strong> We use browser <code className="text-cyan-300 bg-slate-800 px-1 py-0.5 rounded">localStorage</code> solely to remember your local UI preferences (such as Cosmic Dark vs. Clean Light Mode and audio volume settings) without tracking you across different websites.
                </li>
                <li>
                  <strong>Google AdSense &amp; Advertising Partners:</strong> Third-party advertising vendors, including Google, use cookies to serve personalized ads based on a user&apos;s prior visits to our website or other websites on the internet. Users may opt out of personalized advertising by visiting <Link href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline">Google Ads Settings</Link> or <Link href="https://www.aboutads.info/choices" target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline">aboutads.info</Link>.
                </li>
                <li>
                  <strong>Infrastructure &amp; Hosting:</strong> Our web frontend is hosted on Vercel, and our real-time WebSocket backend engine operates on Render with MongoDB cloud persistence. These cloud providers operate under strict industry data protection agreements.
                </li>
              </ul>
            </section>

            {/* Section 4 */}
            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-emerald-400" />
                4. Data Security &amp; Retention
              </h2>
              <p>
                We implement SSL/TLS encryption for all HTTP and WSS (WebSocket Secure) connections. Canvas elements remain stored in persistent storage to ensure the shared mural remains uninterrupted across sessions. We do not sell, rent, or trade your personal or telemetry data to third parties under any circumstances.
              </p>
            </section>

            {/* Section 5 */}
            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-purple-400" />
                5. Your Data Rights (GDPR &amp; CCPA Compliance)
              </h2>
              <p>
                Depending on your location, you may have statutory rights under the General Data Protection Regulation (GDPR) or California Consumer Privacy Act (CCPA), including the right to request information on stored telemetry or request removal of specific content. To request removal of accidental sensitive content placed on the canvas, please contact us immediately.
              </p>
            </section>

            {/* Section 6 */}
            <section className="space-y-3 border-t border-slate-800 pt-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                <Mail className="w-5 h-5 text-cyan-400" />
                6. Contacting the Team
              </h2>
              <p>
                If you have questions, feedback, or removal inquiries regarding this Privacy Policy, please reach out to our team at:
              </p>
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-sm">
                <p><strong>Email:</strong> <a href="mailto:aadityawahal@gmail.com" className="text-cyan-400 underline">aadityawahal@gmail.com</a></p>
                <p><strong>Website:</strong> <Link href="https://endlessync.vercel.app" className="text-cyan-400 underline">https://endlessync.vercel.app</Link></p>
                <p><strong>Developer:</strong> Aaditya Wahal (Endlessync / Webtigo Infinity Canvas)</p>
              </div>
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
