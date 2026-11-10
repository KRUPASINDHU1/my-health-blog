"use client";

import { useEffect, useRef } from "react";

interface ViewTrackerProps {
  slug: string;
}

export function ViewTracker({ slug }: ViewTrackerProps) {
  const hasTracked = useRef(false);

  useEffect(() => {
    if (!slug || hasTracked.current) return;

    // Deduplicate rapid refresh spikes within the user's active session
    const sessionKey = `viewed_post_${slug}`;
    try {
      if (typeof window !== "undefined" && window.sessionStorage) {
        if (sessionStorage.getItem(sessionKey)) {
          return;
        }
        sessionStorage.setItem(sessionKey, "1");
      }
    } catch {
      // Storage unavailable or disabled
    }

    hasTracked.current = true;

    // Use sendBeacon or standard fetch to record the real visit
    const url = `/api/views/${encodeURIComponent(slug)}`;
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      navigator.sendBeacon(url);
    } else {
      fetch(url, { method: "POST" }).catch(() => {});
    }
  }, [slug]);

  return null;
}
