"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

export function HeroSearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = query.trim();
    if (!clean) return; // Prevent dead-end submissions on empty input

    // Sanitize and limit query length
    const sanitized = encodeURIComponent(clean.slice(0, 100));
    router.push(`/blog?q=${sanitized}`);
  };

  return (
    <form onSubmit={handleSubmit} className="relative max-w-xl mx-auto pt-2" role="search">
      <div className="relative">
        <input
          type="search"
          name="q"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          maxLength={100}
          autoComplete="off"
          spellCheck="false"
          placeholder="Search clinical topics, mRNA vaccines, cardiology, AI in healthcare..."
          className="w-full pl-12 pr-28 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-lg text-sm sm:text-base transition [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
        />
        <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />

        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-24 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-full transition cursor-pointer"
            aria-label="Clear search query"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <button
          type="submit"
          disabled={!query.trim()}
          className="absolute right-2 top-2 px-5 py-2 text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl shadow-sm transition"
        >
          Search
        </button>
      </div>
    </form>
  );
}
