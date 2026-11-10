"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, CheckCircle2, AlertCircle, DollarSign, Globe, Shield, Loader2 } from "lucide-react";
import { ResolvedSiteSettings } from "@/lib/settings";

export function SettingsManager({ initialSettings }: { initialSettings: ResolvedSiteSettings }) {
  const router = useRouter();

  const [siteName, setSiteName] = useState(initialSettings.siteName);
  const [tagline, setTagline] = useState(initialSettings.tagline);
  const [description, setDescription] = useState(initialSettings.description);
  const [footerText, setFooterText] = useState(initialSettings.footerText || "");
  const [contactEmail, setContactEmail] = useState(initialSettings.contactEmail || "");
  const [contactAddress, setContactAddress] = useState(initialSettings.contactAddress || "");
  const [contactPhone, setContactPhone] = useState(initialSettings.contactPhone || "");
  const [googleAnalyticsId, setGoogleAnalyticsId] = useState(initialSettings.googleAnalyticsId || "");

  // Monetization & AdSense
  const [adsEnabled, setAdsEnabled] = useState(initialSettings.adsEnabled);
  const [adsensePublisherId, setAdsensePublisherId] = useState(initialSettings.adsensePublisherId || "");
  const [adsTxtContent, setAdsTxtContent] = useState(initialSettings.adsTxtContent || "");
  const [adSlots, setAdSlots] = useState(initialSettings.adSlots);

  // Social links
  const [socialTwitter, setSocialTwitter] = useState(initialSettings.social.twitter || "");
  const [socialLinkedin, setSocialLinkedin] = useState(initialSettings.social.linkedin || "");

  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    const payload = {
      siteName,
      tagline,
      description,
      footerText,
      contactEmail,
      contactAddress,
      contactPhone,
      googleAnalyticsId,
      adsEnabled: String(adsEnabled),
      adsensePublisherId,
      adsTxtContent,
      adSlotsConfig: adSlots,
      socialLinks: {
        twitter: socialTwitter,
        linkedin: socialLinkedin,
      },
    };

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        setFeedback({ type: "success", message: "Site & AdSense settings saved and applied!" });
        router.refresh();
      } else {
        throw new Error(data.error || "Failed to update settings.");
      }
    } catch (err: unknown) {
      setFeedback({ type: "error", message: err instanceof Error ? err.message : "Error saving settings." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-4xl">
      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center gap-2 ${
            feedback.type === "success"
              ? "bg-teal-950/80 border border-teal-800 text-teal-300"
              : "bg-rose-950/80 border border-rose-800 text-rose-300"
          }`}
        >
          {feedback.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          {feedback.message}
        </div>
      )}

      {/* Brand Identity Settings */}
      <div className="p-6 sm:p-8 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-700">
          <Globe className="w-4 h-4 text-teal-400" />
          Publication Identity &amp; Branding
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Site Brand Name (replaces &apos;[SITE NAME]&apos;) *
            </label>
            <input
              type="text"
              required
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              placeholder="e.g. PulseHealth Medical"
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold text-sm focus:ring-2 focus:ring-teal-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Changes the publication title across headers, footers, meta tags, and legal policies.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Primary Tagline *
            </label>
            <input
              type="text"
              required
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1">
            Meta Description (Default Search Summary)
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1">
            Footer Copyright Statement
          </label>
          <input
            type="text"
            value={footerText}
            onChange={(e) => setFooterText(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Public Contact Email</label>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="editorial@sitename.com"
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Public Telephone</label>
            <input
              type="text"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="+1 (800) 555-0199"
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Public Office Address</label>
            <input
              type="text"
              value={contactAddress}
              onChange={(e) => setContactAddress(e.target.value)}
              placeholder="Suite 400, Boston, MA"
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Twitter / X Profile URL</label>
            <input
              type="url"
              value={socialTwitter}
              onChange={(e) => setSocialTwitter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">LinkedIn Page URL</label>
            <input
              type="url"
              value={socialLinkedin}
              onChange={(e) => setSocialLinkedin(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
            />
          </div>
        </div>
      </div>

      {/* Google AdSense & Monetization Settings */}
      <div className="p-6 sm:p-8 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-700">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            Google AdSense Monetization &amp; Ad Management
          </h2>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={adsEnabled}
              onChange={(e) => setAdsEnabled(e.target.checked)}
              className="h-4 w-4 text-teal-600 rounded bg-slate-900 border-slate-700"
            />
            <span className="text-xs font-bold text-white">Global Ads Active</span>
          </label>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Google AdSense Publisher ID
            </label>
            <input
              type="text"
              value={adsensePublisherId}
              onChange={(e) => setAdsensePublisherId(e.target.value.trim())}
              placeholder="ca-pub-1234567890123456"
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:ring-2 focus:ring-teal-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              The AdSense global script is injected ONLY when this ID is provided and user has given cookie consent.
            </p>
          </div>

          {/* Ad Slot Granular Controls */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">
              Enable / Disable Individual Ad Placements
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800">
              <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={adSlots.headerBanner}
                  onChange={(e) => setAdSlots({ ...adSlots, headerBanner: e.target.checked })}
                  className="rounded text-teal-600 bg-slate-800 border-slate-700"
                />
                <span>Header Banner (728x90 leaderboard)</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={adSlots.inArticle}
                  onChange={(e) => setAdSlots({ ...adSlots, inArticle: e.target.checked })}
                  className="rounded text-teal-600 bg-slate-800 border-slate-700"
                />
                <span>In-Article (After 2nd paragraph)</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={adSlots.sidebar}
                  onChange={(e) => setAdSlots({ ...adSlots, sidebar: e.target.checked })}
                  className="rounded text-teal-600 bg-slate-800 border-slate-700"
                />
                <span>Sidebar Display (300x600 skyscraper)</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={adSlots.endOfPost}
                  onChange={(e) => setAdSlots({ ...adSlots, endOfPost: e.target.checked })}
                  className="rounded text-teal-600 bg-slate-800 border-slate-700"
                />
                <span>End of Post (Banner above comments)</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer sm:col-span-2">
                <input
                  type="checkbox"
                  checked={adSlots.stickyMobileFooter}
                  onChange={(e) => setAdSlots({ ...adSlots, stickyMobileFooter: e.target.checked })}
                  className="rounded text-teal-600 bg-slate-800 border-slate-700"
                />
                <span>Sticky Mobile Footer (320x50 anchor)</span>
              </label>
            </div>
          </div>

          {/* Dynamic ads.txt content */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-300">
                ads.txt Content (Served automatically at <code>/ads.txt</code>)
              </label>
              <a
                href="/ads.txt"
                target="_blank"
                className="text-[11px] text-teal-400 hover:underline"
              >
                View Live /ads.txt →
              </a>
            </div>
            <textarea
              rows={3}
              value={adsTxtContent}
              onChange={(e) => setAdsTxtContent(e.target.value)}
              placeholder="google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0"
              className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>
      </div>

      {/* Analytics */}
      <div className="p-6 sm:p-8 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-700">
          <Shield className="w-4 h-4 text-teal-400" />
          Google Analytics 4 Tracking
        </h2>

        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1">
            Google Analytics Measurement ID
          </label>
          <input
            type="text"
            value={googleAnalyticsId}
            onChange={(e) => setGoogleAnalyticsId(e.target.value.trim())}
            placeholder="G-XXXXXXXXXX"
            className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm shadow-md transition disabled:opacity-50 cursor-pointer"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save System Settings
        </button>
      </div>
    </form>
  );
}
