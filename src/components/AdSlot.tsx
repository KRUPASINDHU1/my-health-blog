"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getStoredCookieConsent } from "./CookieConsent";

export type AdPlacement = "headerBanner" | "inArticle" | "sidebar" | "endOfPost" | "stickyMobileFooter";

interface AdSlotProps {
  placement: AdPlacement;
  slotId?: string;
  className?: string;
  publisherId?: string;
  adsEnabled?: boolean;
}

const PLACEMENT_DIMENSIONS: Record<
  AdPlacement,
  { label: string; minHeight: string; maxWidth: string; defaultSlot: string }
> = {
  headerBanner: {
    label: "Leaderboard Banner (728x90 / 320x50)",
    minHeight: "min-h-[90px] sm:min-h-[90px]",
    maxWidth: "max-w-[728px]",
    defaultSlot: "header-banner-ad-unit",
  },
  inArticle: {
    label: "In-Article Rectangle (336x280)",
    minHeight: "min-h-[280px]",
    maxWidth: "max-w-[650px]",
    defaultSlot: "in-article-ad-unit",
  },
  sidebar: {
    label: "Sidebar Display (300x600 / 300x250)",
    minHeight: "min-h-[250px] lg:min-h-[600px]",
    maxWidth: "max-w-[300px]",
    defaultSlot: "sidebar-ad-unit",
  },
  endOfPost: {
    label: "End of Post Banner (728x90)",
    minHeight: "min-h-[90px]",
    maxWidth: "max-w-[728px]",
    defaultSlot: "end-of-post-ad-unit",
  },
  stickyMobileFooter: {
    label: "Mobile Sticky Footer (320x50)",
    minHeight: "min-h-[50px]",
    maxWidth: "max-w-[320px]",
    defaultSlot: "sticky-mobile-footer-ad-unit",
  },
};

export function AdSlot({
  placement,
  slotId,
  className = "",
  publisherId = process.env.NEXT_PUBLIC_ADSENSE_ID || "",
  adsEnabled = true,
}: AdSlotProps) {
  const pathname = usePathname();
  const [hasConsent, setHasConsent] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Policy rule: NEVER display ads on policy/legal, contact, 404, or admin routes
  const exemptRoutes = [
    "/admin",
    "/privacy-policy",
    "/terms",
    "/cookie-policy",
    "/medical-disclaimer",
    "/advertising-disclosure",
    "/contact",
    "/sitemap-page",
  ];

  const isExempt = exemptRoutes.some((route) => pathname?.startsWith(route));

  useEffect(() => {
    const consent = getStoredCookieConsent();
    if (consent?.marketing) {
      setHasConsent(true);
    }

    const handleConsent = (e: Event) => {
      const customEvent = e as CustomEvent;
      setHasConsent(!!customEvent.detail?.marketing);
    };

    window.addEventListener("cookieConsentUpdated", handleConsent);
    return () => window.removeEventListener("cookieConsentUpdated", handleConsent);
  }, []);

  useEffect(() => {
    if (hasConsent && publisherId && adsEnabled && !isExempt) {
      try {
        // Push ad to adsbygoogle queue once rendered
        ((window as unknown as { adsbygoogle: unknown[] }).adsbygoogle =
          (window as unknown as { adsbygoogle: unknown[] }).adsbygoogle || []).push({});
      } catch {
        // ignore
      }
    }
  }, [hasConsent, publisherId, adsEnabled, isExempt, placement]);

  if (isExempt || !adsEnabled || isDismissed) {
    return null;
  }

  const config = PLACEMENT_DIMENSIONS[placement];
  const activeSlotId = slotId || config.defaultSlot;

  if (placement === "stickyMobileFooter") {
    return (
      <div className="fixed bottom-0 inset-x-0 z-40 md:hidden flex flex-col items-center justify-center bg-white/95 dark:bg-slate-900/95 border-t border-slate-200 dark:border-slate-800 py-1 px-2 shadow-lg backdrop-blur">
        <div className="w-full flex items-center justify-between max-w-[320px] px-1 pb-0.5">
          <span className="text-[9px] tracking-wider uppercase font-semibold text-slate-400 dark:text-slate-500">
            Advertisement
          </span>
          <button
            onClick={() => setIsDismissed(true)}
            className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 px-1 font-bold"
            aria-label="Close Ad"
          >
            ✕
          </button>
        </div>
        <div className="w-[320px] h-[50px] flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded border border-dashed border-slate-200 dark:border-slate-700 text-[11px] text-slate-400">
          {publisherId && hasConsent ? (
            <ins
              className="adsbygoogle"
              style={{ display: "inline-block", width: "320px", height: "50px" }}
              data-ad-client={publisherId}
              data-ad-slot={activeSlotId}
            />
          ) : (
            <span>AdSense Slot ({config.label})</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`my-6 flex flex-col items-center justify-center ${className}`}>
      {/* Explicit Ad Label to prevent deceptive placement (AdSense compliance) */}
      <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 dark:text-slate-500 mb-1 select-none">
        Advertisement
      </span>

      {/* Reserved Layout Container to guarantee CLS = 0 */}
      <div
        className={`w-full ${config.maxWidth} ${config.minHeight} rounded-lg border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 flex items-center justify-center overflow-hidden transition-all`}
      >
        {publisherId && hasConsent ? (
          <ins
            className="adsbygoogle"
            style={{ display: "block" }}
            data-ad-client={publisherId}
            data-ad-slot={activeSlotId}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        ) : (
          <div className="p-4 text-center">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Google AdSense Slot Placeholder
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
              {config.label} • Slot ID: <code className="text-teal-600 dark:text-teal-400">{activeSlotId}</code>
            </p>
            {!publisherId && (
              <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900">
                Configure Publisher ID in /admin/settings to activate
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
