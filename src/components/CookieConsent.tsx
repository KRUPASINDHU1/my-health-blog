"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShieldCheck, Settings, X, Check } from "lucide-react";

export interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
}

const STORAGE_KEY = "hc_cookie_consent";

export function getStoredCookieConsent(): CookiePreferences | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function CookieConsent() {
  const [isOpen, setIsOpen] = useState(false);
  const [showManage, setShowManage] = useState(false);
  const [preferences, setPreferences] = useState<{
    essential: boolean;
    analytics: boolean;
    marketing: boolean;
  }>({
    essential: true,
    analytics: true,
    marketing: true,
  });

  useEffect(() => {
    const stored = getStoredCookieConsent();
    if (!stored) {
      // Delay showing slightly so it does not block initial paint
      const timer = setTimeout(() => setIsOpen(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const savePreferences = (prefs: { essential: boolean; analytics: boolean; marketing: boolean }) => {
    const fullPrefs: CookiePreferences = {
      ...prefs,
      essential: true, // always required
      timestamp: new Date().toISOString(),
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fullPrefs));
      // Dispatch custom event for dynamic scripts
      window.dispatchEvent(new CustomEvent("cookieConsentUpdated", { detail: fullPrefs }));
    } catch {
      // ignore
    }
    setIsOpen(false);
    setShowManage(false);
  };

  const handleAcceptAll = () => {
    savePreferences({ essential: true, analytics: true, marketing: true });
  };

  const handleRejectNonEssential = () => {
    savePreferences({ essential: true, analytics: false, marketing: false });
  };

  const handleSaveCustom = () => {
    savePreferences(preferences);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-6 bg-transparent pointer-events-none">
      <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-5 sm:p-6 pointer-events-auto transition-all animate-in fade-in slide-in-from-bottom-4 duration-300">
        {!showManage ? (
          <div>
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="p-2 sm:p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  We respect your privacy and health data
                </h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  We use cookies and third-party advertising technologies (including Google AdSense) to enhance your browsing experience, analyze site traffic, and deliver relevant health content. You can accept all, reject non-essential cookies, or customize your preferences anytime in our{" "}
                  <Link href="/cookie-policy" className="text-teal-600 dark:text-teal-400 underline hover:text-teal-700">
                    Cookie Policy
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy-policy" className="text-teal-600 dark:text-teal-400 underline hover:text-teal-700">
                    Privacy Policy
                  </Link>.
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-end gap-2 sm:gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setShowManage(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <Settings className="w-4 h-4" />
                Customize
              </button>
              <button
                onClick={handleRejectNonEssential}
                className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition"
              >
                Reject Non-Essential
              </button>
              <button
                onClick={handleAcceptAll}
                className="px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm transition"
              >
                Accept All Cookies
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-teal-600" />
                Cookie &amp; Advertising Preferences
              </h3>
              <button
                onClick={() => setShowManage(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              <div className="flex items-start justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <div className="pr-4">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-slate-900 dark:text-white">Strictly Necessary Cookies</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 uppercase">
                      Always Active
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Required for core security, network management, accessibility, and session authentication.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={true}
                  disabled
                  className="mt-1 h-4 w-4 text-teal-600 rounded cursor-not-allowed opacity-75"
                />
              </div>

              <div className="flex items-start justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <div className="pr-4">
                  <span className="font-semibold text-sm text-slate-900 dark:text-white">Analytics &amp; Performance</span>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Helps us understand reader interaction, page load speeds, and popular medical topics to improve editorial quality.
                  </p>
                </div>
                <input
                  type="checkbox"
                  id="consent-analytics"
                  checked={preferences.analytics}
                  onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                  className="mt-1 h-4 w-4 text-teal-600 rounded cursor-pointer focus:ring-teal-500"
                />
              </div>

              <div className="flex items-start justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <div className="pr-4">
                  <span className="font-semibold text-sm text-slate-900 dark:text-white">Advertising &amp; Google AdSense</span>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Enables Google AdSense and authorized partners to display contextual or personalized advertisements supporting our free publication.
                  </p>
                </div>
                <input
                  type="checkbox"
                  id="consent-marketing"
                  checked={preferences.marketing}
                  onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                  className="mt-1 h-4 w-4 text-teal-600 rounded cursor-pointer focus:ring-teal-500"
                />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setShowManage(false)}
                className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
              >
                Back
              </button>
              <button
                onClick={handleSaveCustom}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm transition"
              >
                <Check className="w-4 h-4" />
                Save Preferences
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
