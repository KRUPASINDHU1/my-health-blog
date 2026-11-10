"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Upload, Copy, Check, Trash2, Image as ImageIcon, Loader2, Link as LinkIcon, Plus } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface MediaItemData {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  mimeType: string;
  size: number;
  altText?: string | null;
  createdAt: Date | string;
}

export function MediaLibrary({ initialMedia }: { initialMedia: MediaItemData[] }) {
  const router = useRouter();
  const [media, setMedia] = useState<MediaItemData[]>(initialMedia);
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageTitle, setImageTitle] = useState("");
  const [savingUrl, setSavingUrl] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", files[0]);

    try {
      const res = await fetch("/api/media", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setMedia([data.media, ...media]);
        router.refresh();
      } else {
        alert(data.error || "Upload failed");
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error uploading media file");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleAddByUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl.trim()) return;

    setSavingUrl(true);
    try {
      const res = await fetch("/api/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: imageUrl.trim(),
          originalName: imageTitle.trim() || "External Image",
          altText: imageTitle.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMedia([data.media, ...media]);
        setImageUrl("");
        setImageTitle("");
        setShowUrlInput(false);
        router.refresh();
      } else {
        alert(data.error || "Failed to add image URL");
      }
    } catch {
      alert("Error adding image by URL");
    } finally {
      setSavingUrl(false);
    }
  };

  const handleCopyUrl = (item: MediaItemData) => {
    navigator.clipboard.writeText(item.url);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Permanently delete this media asset?")) return;
    try {
      const res = await fetch(`/api/media/${id}`, { method: "DELETE" });
      if (res.ok) {
        setMedia(media.filter((m) => m.id !== id));
        router.refresh();
      }
    } catch {
      alert("Failed to delete media");
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Banner */}
      <div className="p-8 rounded-2xl border-2 border-dashed border-slate-700 bg-slate-800/40 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-teal-950 text-teal-400 flex items-center justify-center mx-auto">
          {uploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">Upload New Medical Image</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            PNG, JPG, WebP, SVG up to 10MB
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
          <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow transition cursor-pointer">
            <Upload className="w-4 h-4" />
            {uploading ? "Uploading..." : "Upload from Computer"}
            <input
              type="file"
              accept="image/*"
              disabled={uploading}
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-semibold text-xs transition cursor-pointer"
          >
            <LinkIcon className="w-4 h-4 text-teal-400" />
            {showUrlInput ? "Cancel URL Input" : "Add by Image URL"}
          </button>
        </div>

        {showUrlInput && (
          <form onSubmit={handleAddByUrl} className="max-w-md mx-auto pt-3 space-y-2 text-left">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">Image URL *</label>
              <input
                type="url"
                required
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">Image Title / Description</label>
              <input
                type="text"
                value={imageTitle}
                onChange={(e) => setImageTitle(e.target.value)}
                placeholder="Cardiovascular MRI Scan"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <button
              type="submit"
              disabled={savingUrl}
              className="w-full py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition disabled:opacity-50"
            >
              {savingUrl ? "Saving..." : "Save Image to Library"}
            </button>
          </form>
        )}
      </div>

      {/* Grid */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
          All Media Files ({media.length})
        </h3>

        {media.length === 0 ? (
          <div className="p-12 text-center text-slate-500 bg-slate-800/30 rounded-2xl border border-slate-800">
            <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No media uploaded yet. Use the uploader above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {media.map((item) => (
              <div
                key={item.id}
                className="group p-2.5 rounded-xl bg-slate-800/70 border border-slate-700/80 space-y-2 flex flex-col justify-between"
              >
                <div className="relative aspect-square rounded-lg overflow-hidden bg-slate-900 border border-slate-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.url}
                    alt={item.originalName}
                    className="object-cover w-full h-full group-hover:scale-105 transition"
                  />
                </div>

                <div>
                  <p className="text-xs font-bold text-white truncate" title={item.originalName}>
                    {item.originalName}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {(item.size / 1024).toFixed(1)} KB • {formatDate(item.createdAt)}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-700/60">
                  <button
                    onClick={() => handleCopyUrl(item)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-400 hover:text-teal-300"
                    title="Copy Image URL"
                  >
                    {copiedId === item.id ? (
                      <>
                        <Check className="w-3 h-3" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" /> Copy URL
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1 text-rose-400 hover:text-rose-300"
                    title="Delete Image"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
