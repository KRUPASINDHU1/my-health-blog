"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Users, Plus, Trash2, Edit, ShieldCheck, Mail, Twitter, Linkedin, Loader2, X, CheckCircle2, AlertCircle, Upload } from "lucide-react";

interface AuthorItem {
  id: string;
  name: string;
  slug: string;
  credentials: string;
  title: string;
  bio: string;
  avatar: string;
  email?: string | null;
  socialTwitter?: string | null;
  socialLinkedin?: string | null;
  _count: { posts: number; reviewedPosts: number };
}

export function AuthorManager({ initialAuthors }: { initialAuthors: AuthorItem[] }) {
  const router = useRouter();
  const [authors, setAuthors] = useState<AuthorItem[]>(initialAuthors);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<AuthorItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    credentials: "",
    title: "",
    bio: "",
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80",
    email: "",
    socialTwitter: "",
    socialLinkedin: "",
  });

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    setFeedback(null);
    try {
      const data = new FormData();
      data.append("file", file);
      data.append("altText", `Avatar for ${formData.name || "author"}`);

      const res = await fetch("/api/media", {
        method: "POST",
        body: data,
      });

      const json = await res.json();
      if (res.ok && json.media?.url) {
        setFormData((prev) => ({ ...prev, avatar: json.media.url }));
        setFeedback({ type: "success", message: "Photo uploaded and avatar updated successfully!" });
      } else {
        throw new Error(json.error || "Failed to upload photo.");
      }
    } catch (err: unknown) {
      setFeedback({ type: "error", message: err instanceof Error ? err.message : "Upload failed" });
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const startCreate = () => {
    setEditingAuthor(null);
    setFormData({
      name: "",
      credentials: "",
      title: "",
      bio: "",
      avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80",
      email: "",
      socialTwitter: "",
      socialLinkedin: "",
    });
    setShowCreateForm(true);
    setFeedback(null);
  };

  const startEdit = (author: AuthorItem) => {
    setShowCreateForm(false);
    setEditingAuthor(author);
    setFormData({
      name: author.name,
      credentials: author.credentials,
      title: author.title,
      bio: author.bio,
      avatar: author.avatar,
      email: author.email || "",
      socialTwitter: author.socialTwitter || "",
      socialLinkedin: author.socialLinkedin || "",
    });
    setFeedback(null);
  };

  const cancelForm = () => {
    setShowCreateForm(false);
    setEditingAuthor(null);
    setFeedback(null);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/authors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        setAuthors([...authors, { ...data.author, _count: { posts: 0, reviewedPosts: 0 } }]);
        setShowCreateForm(false);
        setFeedback({ type: "success", message: `Author "${data.author.name}" created successfully!` });
        router.refresh();
      } else {
        throw new Error(data.error || "Failed to create author.");
      }
    } catch (err: unknown) {
      setFeedback({ type: "error", message: err instanceof Error ? err.message : "Error creating author." });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAuthor) return;

    setLoading(true);
    setFeedback(null);

    try {
      const res = await fetch(`/api/authors/${editingAuthor.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        setAuthors(
          authors.map((a) =>
            a.id === editingAuthor.id
              ? { ...data.author, _count: a._count }
              : a
          )
        );
        setEditingAuthor(null);
        setFeedback({ type: "success", message: `Author "${data.author.name}" updated successfully!` });
        router.refresh();
      } else {
        throw new Error(data.error || "Failed to update author.");
      }
    } catch (err: unknown) {
      setFeedback({ type: "error", message: err instanceof Error ? err.message : "Error updating author." });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (author: AuthorItem) => {
    const postNote = author._count.posts > 0
      ? ` Note: This author has ${author._count.posts} post(s). Their posts will be safely reassigned to another author.`
      : "";

    if (!confirm(`Are you sure you want to delete author "${author.name}"?${postNote}`)) return;

    setFeedback(null);
    try {
      const res = await fetch(`/api/authors/${author.id}`, { method: "DELETE" });
      const data = await res.json();

      if (res.ok) {
        setAuthors(authors.filter((a) => a.id !== author.id));
        setFeedback({ type: "success", message: `Author "${author.name}" deleted successfully.` });
        router.refresh();
      } else {
        throw new Error(data.error || "Failed to delete author.");
      }
    } catch (err: unknown) {
      setFeedback({ type: "error", message: err instanceof Error ? err.message : "Error deleting author." });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Add Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-teal-400" />
          Active Authors &amp; Reviewers ({authors.length})
        </h2>
        {!showCreateForm && !editingAuthor && (
          <button
            onClick={startCreate}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Medical Expert
          </button>
        )}
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center justify-between gap-2 ${
            feedback.type === "success"
              ? "bg-teal-950/80 border border-teal-800 text-teal-300"
              : "bg-rose-950/80 border border-rose-800 text-rose-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-teal-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-white"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Create / Edit Form */}
      {(showCreateForm || editingAuthor) && (
        <form
          onSubmit={editingAuthor ? handleUpdate : handleCreate}
          className="p-6 rounded-2xl bg-slate-800/90 border border-slate-700 shadow-xl space-y-4 animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-700">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Edit className="w-4 h-4 text-teal-400" />
              {editingAuthor ? `Edit Author: ${editingAuthor.name}` : "Create New Medical Expert"}
            </h3>
            <button
              type="button"
              onClick={cancelForm}
              className="p-1 text-slate-400 hover:text-white rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Full Name &amp; Degree *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Dr. Sarah Jenkins"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Clinical Credentials *</label>
              <input
                type="text"
                required
                value={formData.credentials}
                onChange={(e) => setFormData({ ...formData, credentials: e.target.value })}
                placeholder="MD, FACC - Board Certified Cardiologist"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Institutional Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Associate Professor of Medicine"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Clinical Biography *</label>
            <textarea
              rows={3}
              required
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Clinical training, fellowship, academic interests, publications..."
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs leading-relaxed focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Avatar Upload & Preview */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-700/80 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-teal-500 bg-slate-800 shrink-0">
                  {formData.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={formData.avatar}
                      alt="Avatar Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500 text-[10px] font-bold">
                      No Photo
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-200">
                    Profile Avatar Photo
                  </label>
                  <p className="text-[11px] text-slate-400">
                    Recommended: Square (1:1), 400×400 px, JPG/PNG under 500 KB.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={uploadingAvatar}
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition cursor-pointer disabled:opacity-50"
                >
                  <Upload className="w-3.5 h-3.5" />
                  {uploadingAvatar ? "Uploading Photo..." : "Upload Photo from Computer"}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={handleAvatarFileUpload}
                  className="hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Avatar Image URL or Relative Upload Path
              </label>
              <input
                type="text"
                value={formData.avatar}
                onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                placeholder="/uploads/... or https://..."
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-teal-500"
              />
              {formData.avatar && formData.avatar.includes("drive.google.com") && (
                <p className="mt-1.5 text-xs text-amber-400 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  Google Drive links do not display directly on websites. Please click &quot;Upload Photo from Computer&quot; above to upload your photo directly.
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Public Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="s.jenkins@sitename.com"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Twitter / X URL</label>
              <input
                type="url"
                value={formData.socialTwitter}
                onChange={(e) => setFormData({ ...formData, socialTwitter: e.target.value })}
                placeholder="https://twitter.com/..."
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">LinkedIn URL</label>
              <input
                type="url"
                value={formData.socialLinkedin}
                onChange={(e) => setFormData({ ...formData, socialLinkedin: e.target.value })}
                placeholder="https://linkedin.com/in/..."
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={cancelForm}
              className="px-4 py-2 rounded-xl bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow transition cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                editingAuthor ? "Update Author Profile" : "Save Author Profile"
              )}
            </button>
          </div>
        </form>
      )}

      {/* Grid of Authors */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {authors.map((author) => (
          <div
            key={author.id}
            className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/80 flex flex-col justify-between shadow-xs hover:border-teal-500/40 transition"
          >
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="relative w-12 h-12 rounded-xl overflow-hidden ring-2 ring-teal-500/30 shrink-0 bg-slate-900">
                  <Image
                    src={author.avatar}
                    alt={author.name}
                    fill
                    unoptimized
                    className="object-cover"
                    sizes="48px"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-sm text-white truncate">{author.name}</h3>
                  <p className="text-xs text-teal-400 font-medium truncate">{author.credentials}</p>
                  <p className="text-[10px] text-slate-400 truncate">{author.title}</p>
                </div>
              </div>

              <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed mb-4">
                {author.bio}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">
                {author._count.posts} {author._count.posts === 1 ? "article" : "articles"}
                {author._count.reviewedPosts > 0 && ` • ${author._count.reviewedPosts} reviewed`}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => startEdit(author)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-900/60 hover:bg-teal-900 text-teal-300 text-xs font-semibold transition"
                  title="Edit Author"
                >
                  <Edit className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  onClick={() => handleDelete(author)}
                  className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 transition"
                  title="Delete Author"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
