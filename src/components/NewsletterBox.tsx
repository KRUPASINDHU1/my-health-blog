"use client";

import { useState } from "react";
import { Mail, CheckCircle2, AlertCircle, Loader2, X } from "lucide-react";

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/;

interface NewsletterBoxProps {
  source?: string;
  title?: string;
  description?: string;
  className?: string;
}

export function NewsletterBox({
  source = "general_page",
  title = "Stay Ahead of Clinical Advances",
  description = "Join over 25,000 physicians, health researchers, and informed patients receiving our weekly curated digest of peer-reviewed breakthroughs.",
  className = "",
}: NewsletterBoxProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();

    if (!cleanEmail) {
      setStatus("error");
      setToastMessage("Email address is required.");
      return;
    }

    if (!EMAIL_REGEX.test(cleanEmail)) {
      setStatus("error");
      setToastMessage("Please enter a valid email address (e.g., name@domain.com).");
      return;
    }

    if (cleanEmail.length > 120) {
      setStatus("error");
      setToastMessage("Email address must not exceed 120 characters.");
      return;
    }

    setStatus("loading");
    setToastMessage(null);

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail.toLowerCase(), source }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Subscription failed. Please try again.");
      }

      setStatus("success");
      setToastMessage("Thank you for subscribing! Check your inbox for our latest clinical briefing.");
      setEmail("");
    } catch (err: unknown) {
      setStatus("error");
      setToastMessage(err instanceof Error ? err.message : "An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div
      className={`p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-teal-900 via-teal-950 to-slate-900 text-white shadow-xl relative overflow-hidden ${className}`}
    >
      {/* Subtle background glow */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-2xl">
        <div className="w-10 h-10 rounded-xl bg-teal-800/80 border border-teal-700/60 flex items-center justify-center mb-4 text-teal-300">
          <Mail className="w-5 h-5" />
        </div>

        <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-2">
          {title}
        </h3>
        <p className="text-sm text-teal-100/80 leading-relaxed mb-6">
          {description}
        </p>

        {status === "success" ? (
          <div className="p-4 rounded-xl bg-teal-800/40 border border-teal-600/50 flex items-start justify-between gap-3 text-teal-200 animate-in fade-in duration-200">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0" />
              <p className="text-sm font-medium">{toastMessage}</p>
            </div>
            <button
              onClick={() => {
                setStatus("idle");
                setToastMessage(null);
              }}
              className="p-1 rounded hover:bg-teal-700/50 text-teal-300 transition"
              aria-label="Dismiss message"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-2.5">
              <input
                type="email"
                value={email}
                maxLength={120}
                disabled={status === "loading"}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === "error") setStatus("idle");
                }}
                placeholder="Enter your professional or personal email..."
                required
                className="flex-1 px-4 py-3 rounded-xl bg-slate-900/80 border border-teal-700/60 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm disabled:opacity-60 transition"
              />
              <button
                type="submit"
                disabled={status === "loading" || !email.trim()}
                className="px-6 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shrink-0 cursor-pointer"
              >
                {status === "loading" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Subscribing...
                  </>
                ) : (
                  "Subscribe Free"
                )}
              </button>
            </div>

            {status === "error" && toastMessage && (
              <div
                role="alert"
                className="p-3 rounded-xl bg-rose-950/80 border border-rose-800/80 text-rose-200 text-xs flex items-center justify-between gap-2 animate-in fade-in slide-in-from-top-1"
              >
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{toastMessage}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setToastMessage(null)}
                  className="p-0.5 rounded hover:bg-rose-900/50 transition text-rose-300"
                  aria-label="Dismiss error"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <p className="text-[11px] text-teal-200/60">
              Zero spam. Unsubscribe in one click at any time. We strictly respect your privacy.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
