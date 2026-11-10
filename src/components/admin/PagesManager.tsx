"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Files, Save, CheckCircle2, AlertCircle, ExternalLink, Loader2 } from "lucide-react";

interface PageItem {
  id: string;
  slug: string;
  title: string;
  content: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  updatedAt: Date | string;
}

export function PagesManager({ initialPages }: { initialPages: PageItem[] }) {
  const router = useRouter();
  const [pages, setPages] = useState<PageItem[]>(initialPages);
  const [selectedSlug, setSelectedSlug] = useState<string>(initialPages[0]?.slug || "about");

  const currentPage = pages.find((p) => p.slug === selectedSlug) || pages[0];

  const [title, setTitle] = useState(currentPage?.title || "");
  const [content, setContent] = useState(currentPage?.content || "");
  const [metaTitle, setMetaTitle] = useState(currentPage?.metaTitle || "");
  const [metaDescription, setMetaDescription] = useState(currentPage?.metaDescription || "");
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleSelectPage = (slug: string) => {
    setSelectedSlug(slug);
    const p = pages.find((item) => item.slug === slug);
    if (p) {
      setTitle(p.title);
      setContent(p.content);
      setMetaTitle(p.metaTitle || "");
      setMetaDescription(p.metaDescription || "");
      setFeedback(null);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      const res = await fetch(`/api/pages/${selectedSlug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          metaTitle,
          metaDescription,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setPages(pages.map((p) => (p.slug === selectedSlug ? data.page : p)));
        setFeedback({ type: "success", message: "Page content updated and live!" });
        router.refresh();
      } else {
        throw new Error(data.error || "Update failed");
      }
    } catch (err: unknown) {
      setFeedback({ type: "error", message: err instanceof Error ? err.message : "Error saving page." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Page Tabs Sidebar (Col 4) */}
      <div className="lg:col-span-4 space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Select Page to Edit
        </h2>

        <div className="space-y-1.5">
          {pages.map((page) => (
            <button
              key={page.id}
              onClick={() => handleSelectPage(page.slug)}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-semibold transition flex items-center justify-between ${
                selectedSlug === page.slug
                  ? "bg-teal-600 text-white shadow-sm"
                  : "bg-slate-800/70 text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <span>{page.title}</span>
              <span className="text-[10px] opacity-75 font-mono">/{page.slug}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Page Editor (Col 8) */}
      <div className="lg:col-span-8">
        <form onSubmit={handleSave} className="p-6 sm:p-8 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-700">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Files className="w-4 h-4 text-teal-400" />
                Editing: {currentPage?.title}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Public URL: <code className="text-teal-400">/{selectedSlug}</code>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={`/${selectedSlug}`}
                target="_blank"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-700 text-xs font-semibold text-slate-200 hover:text-white"
              >
                <ExternalLink className="w-3.5 h-3.5" /> View Live
              </Link>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow transition cursor-pointer"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Save Changes
              </button>
            </div>
          </div>

          {feedback && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                feedback.type === "success"
                  ? "bg-teal-950/80 border border-teal-800 text-teal-300"
                  : "bg-rose-950/80 border border-rose-800 text-rose-300"
              }`}
            >
              {feedback.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              {feedback.message}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Page Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold text-sm focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Page HTML Content (Formatted Sections)
            </label>
            <textarea
              rows={16}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-4 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 font-mono text-xs leading-relaxed focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-700">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Meta Title</label>
              <input
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Meta Description</label>
              <input
                type="text"
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
