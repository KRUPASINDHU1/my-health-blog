"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Save,
  ArrowLeft,
  Image as ImageIcon,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Clock,
  ExternalLink,
  Code,
  List,
  ListOrdered,
  Heading2,
  Heading3,
  Bold,
  Italic,
  Quote,
  Table as TableIcon,
  Loader2,
} from "lucide-react";
import { calculateReadingTime } from "@/lib/reading-time";
import { slugify } from "@/lib/utils";

interface CategoryOption {
  id: string;
  name: string;
  color?: string;
}

interface AuthorOption {
  id: string;
  name: string;
  credentials?: string;
}

interface TagOption {
  id: string;
  name: string;
}

interface SourceItem {
  title: string;
  url: string;
  citation?: string;
}

interface PostEditorProps {
  initialData?: {
    id?: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    featuredImage: string;
    featuredImageAlt?: string;
    status: string;
    authorId: string;
    reviewedById?: string | null;
    isFeatured?: boolean;
    metaTitle?: string | null;
    metaDescription?: string | null;
    canonicalUrl?: string | null;
    sources?: string | null;
    publishedAt?: Date | string | null;
    categoryIds?: string[];
    tagIds?: string[];
  };
  categories: CategoryOption[];
  authors: AuthorOption[];
  tags: TagOption[];
}

export function PostEditor({
  initialData,
  categories,
  authors,
  tags,
}: PostEditorProps) {
  const router = useRouter();
  const isEditing = Boolean(initialData?.id);

  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [featuredImage, setFeaturedImage] = useState(
    initialData?.featuredImage || "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80"
  );
  const [featuredImageAlt, setFeaturedImageAlt] = useState(initialData?.featuredImageAlt || "");
  const [status, setStatus] = useState(initialData?.status || "PUBLISHED");
  const [authorId, setAuthorId] = useState(initialData?.authorId || authors[0]?.id || "");
  const [reviewedById, setReviewedById] = useState(initialData?.reviewedById || "");
  const [isFeatured, setIsFeatured] = useState(Boolean(initialData?.isFeatured));
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialData?.categoryIds || (categories[0] ? [categories[0].id] : [])
  );
  const [selectedTags, setSelectedTags] = useState<string[]>(initialData?.tagIds || []);
  const [metaTitle, setMetaTitle] = useState(initialData?.metaTitle || "");
  const [metaDescription, setMetaDescription] = useState(initialData?.metaDescription || "");
  const [canonicalUrl, setCanonicalUrl] = useState(initialData?.canonicalUrl || "");

  // Sources manager
  let initialSources: SourceItem[] = [];
  try {
    if (initialData?.sources) initialSources = JSON.parse(initialData.sources);
  } catch {}
  const [sourcesList, setSourcesList] = useState<SourceItem[]>(initialSources);

  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const readingTime = calculateReadingTime(content);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEditing || !slug) {
      setSlug(slugify(val));
    }
    if (!metaTitle) setMetaTitle(val);
  };

  const insertFormatting = (before: string, after: string = "") => {
    const textarea = document.getElementById("post-content-area") as HTMLTextAreaElement | null;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end);
    const replacement = `${before}${selected || "Sample text"}${after}`;

    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);
  };

  const addSource = () => {
    setSourcesList([...sourcesList, { title: "", url: "", citation: "" }]);
  };

  const removeSource = (index: number) => {
    setSourcesList(sourcesList.filter((_, i) => i !== index));
  };

  const updateSource = (index: number, field: keyof SourceItem, value: string) => {
    const updated = [...sourcesList];
    updated[index][field] = value;
    setSourcesList(updated);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content || !authorId) {
      setFeedback({ type: "error", message: "Title, content, and primary author are required." });
      return;
    }

    setSaving(true);
    setFeedback(null);

    const payload = {
      title,
      slug: slugify(slug || title),
      excerpt: excerpt || title,
      content,
      featuredImage,
      featuredImageAlt,
      status,
      authorId,
      reviewedById: reviewedById || null,
      isFeatured,
      categoryIds: selectedCategories,
      tagIds: selectedTags,
      metaTitle: metaTitle || title,
      metaDescription: metaDescription || excerpt,
      canonicalUrl: canonicalUrl || null,
      sources: JSON.stringify(sourcesList),
    };

    try {
      const url = isEditing ? `/api/posts/${initialData?.id}` : "/api/posts";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save post.");

      setFeedback({ type: "success", message: "Post saved successfully!" });
      setTimeout(() => {
        router.push("/admin/posts");
        router.refresh();
      }, 1000);
    } catch (err: unknown) {
      setFeedback({ type: "error", message: err instanceof Error ? err.message : "Error saving post." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-8">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-800">
        <Link
          href="/admin/posts"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" /> Back to All Posts
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 text-xs text-slate-300">
            <Clock className="w-3.5 h-3.5 text-teal-400" />
            <span>Est. {readingTime} min read</span>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition disabled:opacity-50 cursor-pointer"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isEditing ? "Update Article" : "Publish Article"}
          </button>
        </div>
      </div>

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

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Editor Main Column (Col 8) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Article Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="e.g. Breakthroughs in Precision Oncology: Neoantigen mRNA Therapeutics"
              className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold text-lg sm:text-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              URL Slug *
            </label>
            <div className="flex items-center">
              <span className="px-3 py-2.5 rounded-l-xl bg-slate-700/80 border border-r-0 border-slate-700 text-slate-400 text-xs">
                /blog/
              </span>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-3 py-2.5 rounded-r-xl bg-slate-800 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Excerpt / Clinical Summary *
            </label>
            <textarea
              rows={3}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="A concise, evidence-based abstract summarizing the core clinical mechanisms..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Rich Content Editor */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-300">
                Article Body Content (Rich Text / Formatted HTML) *
              </label>
            </div>

            {/* Quick Formatting Toolbar */}
            <div className="flex flex-wrap items-center gap-1 p-2 rounded-t-xl bg-slate-800 border border-b-0 border-slate-700 text-slate-300 text-xs">
              <button
                type="button"
                onClick={() => insertFormatting("<h2>", "</h2>")}
                className="p-1.5 rounded hover:bg-slate-700 hover:text-white"
                title="Heading 2"
              >
                <Heading2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("<h3>", "</h3>")}
                className="p-1.5 rounded hover:bg-slate-700 hover:text-white"
                title="Heading 3"
              >
                <Heading3 className="w-4 h-4" />
              </button>
              <span className="w-px h-4 bg-slate-700 mx-1" />
              <button
                type="button"
                onClick={() => insertFormatting("<strong>", "</strong>")}
                className="p-1.5 rounded hover:bg-slate-700 hover:text-white"
                title="Bold"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("<em>", "</em>")}
                className="p-1.5 rounded hover:bg-slate-700 hover:text-white"
                title="Italic"
              >
                <Italic className="w-4 h-4" />
              </button>
              <span className="w-px h-4 bg-slate-700 mx-1" />
              <button
                type="button"
                onClick={() => insertFormatting("<ul>\n  <li>", "</li>\n</ul>")}
                className="p-1.5 rounded hover:bg-slate-700 hover:text-white"
                title="Bullet List"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("<ol>\n  <li>", "</li>\n</ol>")}
                className="p-1.5 rounded hover:bg-slate-700 hover:text-white"
                title="Numbered List"
              >
                <ListOrdered className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("<blockquote>\n  ", "\n</blockquote>")}
                className="p-1.5 rounded hover:bg-slate-700 hover:text-white"
                title="Quote"
              >
                <Quote className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("<table class='min-w-full border'>\n  <thead><tr><th class='border p-2'>Parameter</th><th class='border p-2'>Clinical Result</th></tr></thead>\n  <tbody><tr><td class='border p-2'>Biomarker A</td><td class='border p-2'>98.4%</td></tr></tbody>\n</table>")}
                className="p-1.5 rounded hover:bg-slate-700 hover:text-white"
                title="Insert Table"
              >
                <TableIcon className="w-4 h-4" />
              </button>
              <span className="w-px h-4 bg-slate-700 mx-1" />
              <button
                type="button"
                onClick={() => insertFormatting('<div style="background-color: #eef7fc; border-left: 4px solid #0d9488; padding: 15px; border-radius: 4px; margin: 20px 0;">\n  <strong>Key Clinical Takeaway:</strong> ', "\n</div>")}
                className="p-1.5 rounded hover:bg-slate-700 hover:text-teal-300 font-bold text-[11px]"
                title="Insert Clinical Callout Box"
              >
                + Callout Box
              </button>
            </div>

            <textarea
              id="post-content-area"
              rows={18}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your evidence-based medical article here (HTML/rich text supported)..."
              className="w-full p-4 rounded-b-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs sm:text-sm font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Sources and References Manager */}
          <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-teal-400" />
                  Sources &amp; Peer-Reviewed Citations
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Cite journals (e.g. Nature, NEJM, JAMA, Lancet) and official clinical trial DOIs.
                </p>
              </div>
              <button
                type="button"
                onClick={addSource}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-teal-900/60 text-teal-300 hover:bg-teal-900 text-xs font-semibold"
              >
                <Plus className="w-3.5 h-3.5" /> Add Citation
              </button>
            </div>

            <div className="space-y-3">
              {sourcesList.length === 0 ? (
                <p className="text-xs text-slate-500 py-3 text-center">No references added yet.</p>
              ) : (
                sourcesList.map((src, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        value={src.title}
                        onChange={(e) => updateSource(idx, "title", e.target.value)}
                        placeholder="Article / Study Title (e.g. International evaluation of an AI system...)"
                        className="flex-1 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs focus:ring-1 focus:ring-teal-500"
                      />
                      <button
                        type="button"
                        onClick={() => removeSource(idx)}
                        className="p-1.5 text-rose-400 hover:text-rose-300"
                        title="Remove citation"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="url"
                        value={src.url}
                        onChange={(e) => updateSource(idx, "url", e.target.value)}
                        placeholder="https://doi.org/10.1038/..."
                        className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs"
                      />
                      <input
                        type="text"
                        value={src.citation || ""}
                        onChange={(e) => updateSource(idx, "citation", e.target.value)}
                        placeholder="Nature, 577(7788), 89-94 (2020)"
                        className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Settings Column (Col 4) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Publication Status & Visibility */}
          <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300">
              Publishing Controls
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-teal-500"
              >
                <option value="PUBLISHED">Published (Live)</option>
                <option value="DRAFT">Draft</option>
                <option value="SCHEDULED">Scheduled</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="isFeaturedToggle"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="h-4 w-4 text-teal-600 rounded bg-slate-900 border-slate-700 focus:ring-teal-500"
              />
              <label htmlFor="isFeaturedToggle" className="text-xs font-semibold text-white cursor-pointer">
                Feature on Homepage Hero
              </label>
            </div>
          </div>

          {/* Authorship & Clinical Reviewer (E-E-A-T) */}
          <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300">
              Authorship &amp; Clinical Review
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Primary Medical Author *
              </label>
              <select
                value={authorId}
                onChange={(e) => setAuthorId(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-teal-500"
              >
                {authors.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.credentials})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Medically Reviewed By (Optional)
              </label>
              <select
                value={reviewedById || ""}
                onChange={(e) => setReviewedById(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-teal-500"
              >
                <option value="">None (Standard Editorial)</option>
                {authors.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.credentials})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Featured Image */}
          <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300">
              Featured Image
            </h3>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Image URL</label>
              <input
                type="url"
                value={featuredImage}
                onChange={(e) => setFeaturedImage(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Alt Text (Accessibility / SEO)</label>
              <input
                type="text"
                value={featuredImageAlt}
                onChange={(e) => setFeaturedImageAlt(e.target.value)}
                placeholder="Detailed description of medical diagram or photo..."
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {featuredImage && (
              <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-slate-900 mt-2 border border-slate-700">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={featuredImage} alt="Preview" className="object-cover w-full h-full" />
              </div>
            )}
          </div>

          {/* Categories */}
          <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300">
              Categories
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {categories.map((cat) => {
                const checked = selectedCategories.includes(cat.id);
                return (
                  <label key={cat.id} className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCategories([...selectedCategories, cat.id]);
                        } else {
                          setSelectedCategories(selectedCategories.filter((id) => id !== cat.id));
                        }
                      }}
                      className="rounded text-teal-600 bg-slate-900 border-slate-700"
                    />
                    <span>{cat.name}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* SEO Meta Tags */}
          <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300">
              SEO &amp; Open Graph Meta
            </h3>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Meta Title</label>
              <input
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder="Custom SEO title..."
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Meta Description</label>
              <textarea
                rows={2}
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="Custom meta description for search snippets..."
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Canonical URL</label>
              <input
                type="url"
                value={canonicalUrl}
                onChange={(e) => setCanonicalUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
