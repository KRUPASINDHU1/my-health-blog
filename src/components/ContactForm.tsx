"use client";

import { useState } from "react";
import { Send, CheckCircle2, AlertCircle, Loader2, X } from "lucide-react";

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/;

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    honeypot: "", // Bot trap
  });

  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    const cleanName = formData.name.trim();
    if (!cleanName) {
      errors.name = "Full name is required.";
    } else if (cleanName.length > 100) {
      errors.name = "Name must not exceed 100 characters.";
    }

    const cleanEmail = formData.email.trim();
    if (!cleanEmail) {
      errors.email = "Email address is required.";
    } else if (!EMAIL_REGEX.test(cleanEmail)) {
      errors.email = "Please enter a valid email address (e.g., name@domain.com).";
    } else if (cleanEmail.length > 120) {
      errors.email = "Email must not exceed 120 characters.";
    }

    const cleanSubject = formData.subject.trim();
    if (!cleanSubject) {
      errors.subject = "Subject is required.";
    } else if (cleanSubject.length > 150) {
      errors.subject = "Subject must not exceed 150 characters.";
    }

    const cleanMessage = formData.message.trim();
    if (!cleanMessage) {
      errors.message = "Message content is required.";
    } else if (cleanMessage.length < 10) {
      errors.message = "Message must be at least 10 characters long.";
    } else if (cleanMessage.length > 3000) {
      errors.message = "Message must not exceed 3,000 characters.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      setToast({
        type: "error",
        message: "Please correct the highlighted errors before submitting.",
      });
      return;
    }

    setStatus("submitting");
    setToast(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          subject: formData.subject.trim(),
          message: formData.message.trim(),
          honeypot: formData.honeypot,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit message. Please try again.");
      }

      setStatus("success");
      setToast({
        type: "success",
        message: "Your message has been securely submitted to our editorial board.",
      });
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
        honeypot: "",
      });
      setFieldErrors({});
    } catch (err: unknown) {
      setStatus("error");
      setToast({
        type: "error",
        message: err instanceof Error ? err.message : "An unexpected network error occurred.",
      });
    }
  };

  if (status === "success" && !formData.name) {
    return (
      <div className="p-8 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-900 dark:text-teal-200 space-y-4 text-center animate-in fade-in duration-300">
        <div className="w-14 h-14 rounded-full bg-teal-100 dark:bg-teal-900 text-teal-600 dark:text-teal-300 flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <h4 className="text-xl font-bold">Inquiry Dispatched Successfully</h4>
        <p className="text-sm text-teal-800 dark:text-teal-300 max-w-md mx-auto leading-relaxed">
          Thank you for reaching out to HealthTech Spectrum. Our clinical reviewers and editorial team prioritize citations, corrections, and research pitches.
        </p>
        <button
          onClick={() => {
            setStatus("idle");
            setToast(null);
          }}
          className="mt-4 px-5 py-2.5 text-xs font-bold text-teal-700 dark:text-teal-200 bg-white dark:bg-slate-800 rounded-xl border border-teal-300 dark:border-teal-700 hover:bg-teal-50 dark:hover:bg-slate-700 shadow-sm transition cursor-pointer"
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toast Feedback Banner */}
      {toast && (
        <div
          role="alert"
          className={`p-4 rounded-xl text-xs sm:text-sm flex items-start justify-between gap-3 shadow-md transition-all animate-in fade-in slide-in-from-top-1 ${
            toast.type === "success"
              ? "bg-teal-50 dark:bg-teal-950/80 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-200"
              : "bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {toast.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
            )}
            <span className="font-medium">{toast.message}</span>
          </div>
          <button
            onClick={() => setToast(null)}
            className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 transition shrink-0"
            aria-label="Dismiss message"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Anti-spam trap */}
        <div className="hidden" aria-hidden="true">
          <input
            type="text"
            name="honeypot"
            tabIndex={-1}
            autoComplete="off"
            value={formData.honeypot}
            onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="name" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Your Full Name <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400">{formData.name.length}/100</span>
            </div>
            <input
              id="name"
              type="text"
              required
              maxLength={100}
              disabled={status === "submitting"}
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: "" });
              }}
              placeholder="Dr. Jane Doe / John Smith"
              className={`w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 transition disabled:opacity-60 ${
                fieldErrors.name
                  ? "border-rose-400 focus:ring-rose-400"
                  : "border-slate-300 dark:border-slate-700 focus:ring-teal-500"
              }`}
            />
            {fieldErrors.name && (
              <p className="mt-1 text-[11px] text-rose-500 font-medium">{fieldErrors.name}</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="email" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Your Email Address <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400">{formData.email.length}/120</span>
            </div>
            <input
              id="email"
              type="email"
              required
              maxLength={120}
              disabled={status === "submitting"}
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
                if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: "" });
              }}
              placeholder="jane.doe@hospital.org"
              className={`w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 transition disabled:opacity-60 ${
                fieldErrors.email
                  ? "border-rose-400 focus:ring-rose-400"
                  : "border-slate-300 dark:border-slate-700 focus:ring-teal-500"
              }`}
            />
            {fieldErrors.email && (
              <p className="mt-1 text-[11px] text-rose-500 font-medium">{fieldErrors.email}</p>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="subject" className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Subject <span className="text-rose-500">*</span>
            </label>
            <span className="text-[11px] text-slate-400">{formData.subject.length}/150</span>
          </div>
          <input
            id="subject"
            type="text"
            required
            maxLength={150}
            disabled={status === "submitting"}
            value={formData.subject}
            onChange={(e) => {
              setFormData({ ...formData, subject: e.target.value });
              if (fieldErrors.subject) setFieldErrors({ ...fieldErrors, subject: "" });
            }}
            placeholder="e.g., Editorial Question on Oncology Article / Press Inquiry"
            className={`w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 transition disabled:opacity-60 ${
              fieldErrors.subject
                ? "border-rose-400 focus:ring-rose-400"
                : "border-slate-300 dark:border-slate-700 focus:ring-teal-500"
            }`}
          />
          {fieldErrors.subject && (
            <p className="mt-1 text-[11px] text-rose-500 font-medium">{fieldErrors.subject}</p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="message" className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Detailed Message <span className="text-rose-500">*</span>
            </label>
            <span className="text-[11px] text-slate-400">{formData.message.length}/3000</span>
          </div>
          <textarea
            id="message"
            required
            rows={5}
            minLength={10}
            maxLength={3000}
            disabled={status === "submitting"}
            value={formData.message}
            onChange={(e) => {
              setFormData({ ...formData, message: e.target.value });
              if (fieldErrors.message) setFieldErrors({ ...fieldErrors, message: "" });
            }}
            placeholder="Please write your detailed comments, inquiries, or feedback (minimum 10 characters)..."
            className={`w-full px-4 py-3 rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 transition disabled:opacity-60 ${
              fieldErrors.message
                ? "border-rose-400 focus:ring-rose-400"
                : "border-slate-300 dark:border-slate-700 focus:ring-teal-500"
            }`}
          />
          {fieldErrors.message && (
            <p className="mt-1 text-[11px] text-rose-500 font-medium">{fieldErrors.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={status === "submitting"}
          className="w-full py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
        >
          {status === "submitting" ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Verifying &amp; Submitting...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Send Secure Message
            </>
          )}
        </button>
      </form>
    </div>
  );
}
