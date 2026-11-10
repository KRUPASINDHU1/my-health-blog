import Link from "next/link";
import { Activity, ShieldAlert, Mail, Heart, ExternalLink } from "lucide-react";
import { siteConfig } from "@/config/site";

interface FooterProps {
  siteName?: string;
  tagline?: string;
}

export function Footer({
  siteName = siteConfig.name,
  tagline = siteConfig.tagline,
}: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 transition-colors">
      {/* Upper Footer: Branding & Quick Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
                <Activity className="w-6 h-6 stroke-[2.5]" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white">
                {siteName}
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-md">
              {tagline}
            </p>
            <p className="text-xs text-slate-400 leading-relaxed max-w-md">
              Our publication bridges clinical biomedical research with accessible healthcare journalism. Every medical analysis is vetted by our clinical review board under strict E-E-A-T editorial standards.
            </p>
            <div className="pt-2 flex items-center gap-3 text-slate-400">
              <a
                href={siteConfig.social.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-slate-800 hover:text-white hover:bg-slate-700 transition"
                aria-label="Twitter / X"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href={siteConfig.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-slate-800 hover:text-white hover:bg-slate-700 transition"
                aria-label="LinkedIn"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Editorial & Topics */}
          <div>
            <h4 className="text-xs font-bold tracking-wider uppercase text-white mb-4">
              Core Categories
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/category/healthcare-innovation" className="hover:text-teal-400 transition">
                  Healthcare Innovation
                </Link>
              </li>
              <li>
                <Link href="/category/medical-technology" className="hover:text-teal-400 transition">
                  Medical Technology
                </Link>
              </li>
              <li>
                <Link href="/category/wellness" className="hover:text-teal-400 transition">
                  Wellness Science
                </Link>
              </li>
              <li>
                <Link href="/category/nutrition" className="hover:text-teal-400 transition">
                  Clinical Nutrition
                </Link>
              </li>
              <li>
                <Link href="/category/mental-health" className="hover:text-teal-400 transition">
                  Mental Health
                </Link>
              </li>
              <li>
                <Link href="/category/public-health" className="hover:text-teal-400 transition">
                  Public Health
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold tracking-wider uppercase text-white mb-4">
              Publication
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/about" className="hover:text-teal-400 transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/authors" className="hover:text-teal-400 transition">
                  Medical Editorial Board
                </Link>
              </li>
              <li>
                <Link href="/editorial-policy" className="hover:text-teal-400 transition">
                  Editorial Standards
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-teal-400 transition">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/sitemap-page" className="hover:text-teal-400 transition">
                  HTML Sitemap
                </Link>
              </li>
              <li>
                <Link href="/feed.xml" className="hover:text-teal-400 transition flex items-center gap-1">
                  RSS Feed <ExternalLink className="w-3 h-3" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Compliance (Crucial for AdSense approval) */}
          <div>
            <h4 className="text-xs font-bold tracking-wider uppercase text-white mb-4">
              Legal &amp; Transparency
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/medical-disclaimer" className="text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1.5 transition">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Medical Disclaimer
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-teal-400 transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-teal-400 transition">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/cookie-policy" className="hover:text-teal-400 transition">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link href="/advertising-disclosure" className="hover:text-teal-400 transition">
                  Advertising Disclosure
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Mandatory Medical Disclaimer Notice in Footer */}
      <div className="border-t border-slate-800/80 bg-slate-950/60 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 leading-relaxed space-y-2">
            <p className="font-semibold text-slate-300 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
              IMPORTANT CLINICAL &amp; LEGAL NOTICE:
            </p>
            <p>
              The medical analyses, clinical trial discussions, pharmaceutical evaluations, and wellness guides provided on {siteName} are published exclusively for general educational and informational purposes. They do not constitute personalized medical advice, formal medical diagnoses, or treatment plans. You must always consult with a licensed physician or other qualified health provider regarding any personal health concerns or treatment decisions. Never delay seeking professional medical care because of information found on this platform.
            </p>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
            <p>© {currentYear} {siteName}. All rights reserved.</p>
            <p className="flex items-center gap-1">
              Engineered with clinical precision &amp; high-performance Next.js
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
