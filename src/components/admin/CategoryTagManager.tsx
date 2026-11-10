"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Edit, Check, X, FolderTree, Tag as TagIcon, Loader2 } from "lucide-react";

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  color: string;
  order: number;
  _count: { posts: number };
}

interface TagItem {
  id: string;
  name: string;
  slug: string;
  _count: { posts: number };
}

interface Props {
  initialCategories: CategoryItem[];
  initialTags: TagItem[];
}

export function CategoryTagManager({ initialCategories, initialTags }: Props) {
  const router = useRouter();

  // Category state
  const [categories, setCategories] = useState<CategoryItem[]>(initialCategories);
  const [newCatName, setNewCatName] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");
  const [newCatColor, setNewCatColor] = useState("#0d9488");
  const [catLoading, setCatLoading] = useState(false);

  // Tag state
  const [tags, setTags] = useState<TagItem[]>(initialTags);
  const [newTagName, setNewTagName] = useState("");
  const [tagLoading, setTagLoading] = useState(false);

  // Add Category
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    setCatLoading(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCatName.trim(),
          description: newCatDesc.trim(),
          color: newCatColor,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setCategories([...categories, { ...data.category, _count: { posts: 0 } }]);
        setNewCatName("");
        setNewCatDesc("");
        router.refresh();
      }
    } catch {
      alert("Error adding category");
    } finally {
      setCatLoading(false);
    }
  };

  // Delete Category
  const handleDeleteCategory = async (id: string, name: string) => {
    if (!confirm(`Delete category "${name}"?`)) return;
    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      if (res.ok) {
        setCategories(categories.filter((c) => c.id !== id));
        router.refresh();
      }
    } catch {
      alert("Failed to delete category");
    }
  };

  // Add Tag
  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;

    setTagLoading(true);
    try {
      const res = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTagName.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setTags([...tags, { ...data.tag, _count: { posts: 0 } }]);
        setNewTagName("");
        router.refresh();
      }
    } catch {
      alert("Error adding tag");
    } finally {
      setTagLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Categories Column (Col 7) */}
      <div className="lg:col-span-7 space-y-6">
        <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/80">
          <h2 className="text-base font-bold text-white flex items-center gap-2 mb-4">
            <FolderTree className="w-4 h-4 text-teal-400" />
            Categories ({categories.length})
          </h2>

          {/* New Category Form */}
          <form onSubmit={handleAddCategory} className="space-y-3 p-4 rounded-xl bg-slate-900 border border-slate-800 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="e.g. Immunotherapy"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Color Badge</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={newCatColor}
                    onChange={(e) => setNewCatColor(e.target.value)}
                    className="h-8 w-12 rounded cursor-pointer bg-slate-800 border border-slate-700"
                  />
                  <span className="text-xs font-mono text-slate-300">{newCatColor}</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">Description</label>
              <input
                type="text"
                value={newCatDesc}
                onChange={(e) => setNewCatDesc(e.target.value)}
                placeholder="Brief clinical focus..."
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={catLoading}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow transition cursor-pointer"
            >
              {catLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              Add Category
            </button>
          </form>

          {/* List */}
          <div className="divide-y divide-slate-700/60">
            {categories.map((cat) => (
              <div key={cat.id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span
                    className="w-3.5 h-3.5 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <div>
                    <span className="font-bold text-sm text-white">{cat.name}</span>
                    <span className="text-xs text-slate-400 ml-2">(/category/{cat.slug})</span>
                    {cat.description && (
                      <p className="text-xs text-slate-400 line-clamp-1">{cat.description}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">
                    {cat._count.posts} {cat._count.posts === 1 ? "post" : "posts"}
                  </span>
                  <button
                    onClick={() => handleDeleteCategory(cat.id, cat.name)}
                    className="p-1 text-rose-400 hover:text-rose-300"
                    title="Delete Category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tags Column (Col 5) */}
      <div className="lg:col-span-5 space-y-6">
        <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/80">
          <h2 className="text-base font-bold text-white flex items-center gap-2 mb-4">
            <TagIcon className="w-4 h-4 text-teal-400" />
            Tags ({tags.length})
          </h2>

          <form onSubmit={handleAddTag} className="flex gap-2 mb-6">
            <input
              type="text"
              required
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="e.g. mRNA, CRISPR, Telemetry"
              className="flex-1 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs"
            />
            <button
              type="submit"
              disabled={tagLoading}
              className="px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs"
            >
              Add Tag
            </button>
          </form>

          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-300"
              >
                #{tag.name}
                <span className="text-[10px] text-slate-500">({tag._count.posts})</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
