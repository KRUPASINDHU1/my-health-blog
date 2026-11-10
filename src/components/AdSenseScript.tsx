"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { getStoredCookieConsent } from "./CookieConsent";

interface AdSenseScriptProps {
  publisherId?: string;
  enabled?: boolean;
}

export function AdSenseScript({ publisherId, enabled = true }: AdSenseScriptProps) {
  const [canLoad, setCanLoad] = useState(false);

  useEffect(() => {
    if (!publisherId || !enabled) {
      setCanLoad(false);
      return;
    }

    // Check initial cookie consent
    const consent = getStoredCookieConsent();
    if (consent?.marketing) {
      setCanLoad(true);
    }

    // Listen for cookie consent updates
    const handleConsentUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.marketing) {
        setCanLoad(true);
      } else {
        setCanLoad(false);
      }
    };

    window.addEventListener("cookieConsentUpdated", handleConsentUpdate);
    return () => {
      window.removeEventListener("cookieConsentUpdated", handleConsentUpdate);
    };
  }, [publisherId, enabled]);

  if (!canLoad || !publisherId) return null;

  return (
    <Script
      id="google-adsense"
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
