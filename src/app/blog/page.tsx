import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PostCard } from "@/components/PostCard";
import { AdSlot } from "@/components/AdSlot";
import { NewsletterBox } from "@/components/NewsletterBox";
import { getSiteSettings } from "@/lib/settings";
import { Search, Filter, ArrowLeft, ArrowRight, X } from "lucide-react";

interface BlogListingPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    tag?: string;
    page?: string;
  }>;
}

export const revalidate = 60;

export default async function BlogListingPage({ searchParams }: BlogListingPageProps) {
  const { q, category, tag, page } = await searchParams;
  const currentPage = Math.max(1, parseInt(page || "1", 10));
  const pageSize = 9;

  const settings = await getSiteSettings();

  // Sanitize search query input
  const cleanQ = q?.trim() ? q.trim().slice(0, 100) : undefined;

  // Build where conditions
  const where: any = {
    status: "PUBLISHED",
  };

  if (cleanQ) {
    where.OR = [
      { title: { contains: cleanQ, mode: "insensitive" } },
      { excerpt: { contains: cleanQ, mode: "insensitive" } },
      { content: { contains: cleanQ, mode: "insensitive" } },
    ];
  }

  if (category) {
    where.categories = {
      some: { slug: category },
    };
  }

  if (tag) {
    where.tags = {
      some: { slug: tag },
    };
  }

  let totalPosts = 0;
  let posts: any[] = [];
  let categories: any[] = [];
  let tags: any[] = [];

  try {
    const res = await Promise.all([
      prisma.post.count({ where }),
      prisma.post.findMany({
        where,
        include: {
          author: true,
          reviewedBy: true,
          categories: true,
          tags: true,
        },
        orderBy: { publishedAt: "desc" },
        skip: (currentPage - 1) * pageSize,
        take: pageSize,
      }),
      prisma.category.findMany({ orderBy: { order: "asc" } }),
      prisma.tag.findMany({ take: 10 }),
    ]);
    totalPosts = res[0];
    posts = res[1];
    categories = res[2];
    tags = res[3];
  } catch (err) {
    console.warn("Could not query posts during build/render:", err);
  }

  const totalPages = Math.ceil(totalPosts / pageSize);

  return (
    <>
      <Header siteName={settings.siteName} />

      <main className="flex-1 pb-16">
        {/* Header Ad Slot */}
        {settings.adsEnabled && settings.adSlots.headerBanner && (
          <div className="max-w-7xl mx-auto px-4 pt-4 sm:pt-6">
            <AdSlot
              placement="headerBanner"
              publisherId={settings.adsensePublisherId}
              adsEnabled={settings.adsEnabled}
            />
          </div>
        )}

        {/* Page Hero */}
        <section className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200/80 dark:border-slate-800 py-10 sm:py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                Peer-Reviewed Healthcare Archive
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
                All Health &amp; Clinical Articles
              </h1>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
                Explore our full library of evidence-based medical analyses, technology investigations, wellness science, and public health reviews.
              </p>
            </div>

            {/* Search & Filter Bar */}
            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
              <form method="GET" action="/blog" className="flex flex-col sm:flex-row gap-3 max-w-2xl">
                <div className="relative flex-1">
                  <input
                    type="search"
                    name="q"
                    defaultValue={cleanQ || ""}
                    maxLength={100}
                    autoComplete="off"
                    placeholder="Search by keywords, diagnoses, pharmaceuticals..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-xs"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
                {category && <input type="hidden" name="category" value={category} />}
                {tag && <input type="hidden" name="tag" value={tag} />}
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-sm transition shrink-0"
                >
                  Filter Results
                </button>
              </form>

              {/* Active Category Pill Filters */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" />
                  Categories:
                </span>
                <Link
                  href="/blog"
                  className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                    !category
                      ? "bg-teal-600 text-white font-bold"
                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-teal-500"
                  }`}
                >
                  All
                </Link>
                {categories.map((c) => (
                  <Link
                    key={c.id}
                    href={`/blog?category=${c.slug}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                      category === c.slug
                        ? "bg-teal-600 text-white font-bold shadow-xs"
                        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-teal-500"
                    }`}
                  >
                    {c.name}
                  </Link>
                ))}
              </div>

              {/* Active Filter Badges */}
              {(q || category || tag) && (
                <div className="flex items-center gap-2 pt-2 text-xs text-slate-600 dark:text-slate-400">
                  <span>Active Filters:</span>
                  {q && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200">
                      Query: &quot;{q}&quot;
                    </span>
                  )}
                  {category && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200">
                      Category: {category}
                    </span>
                  )}
                  {tag && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200">
                      Tag: #{tag}
                    </span>
                  )}
                  <Link
                    href="/blog"
                    className="text-rose-500 hover:text-rose-700 font-bold ml-2 flex items-center gap-0.5"
                  >
                    <X className="w-3.5 h-3.5" /> Clear All
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Articles Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
          <div className="flex items-center justify-between mb-6">
            <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">
              Showing {posts.length} of {totalPosts} {totalPosts === 1 ? "article" : "articles"}
            </p>
          </div>

          {posts.length === 0 ? (
            <div className="text-center py-16 px-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <p className="text-base font-semibold text-slate-700 dark:text-slate-300">
                No clinical articles found matching your criteria.
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Try adjusting your search terms or clearing active filters.
              </p>
              <Link
                href="/blog"
                className="inline-block mt-4 px-4 py-2 text-xs font-bold text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition"
              >
                Reset Search
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 flex items-center justify-center gap-3">
              {currentPage > 1 ? (
                <Link
                  href={`/blog?page=${currentPage - 1}${q ? `&q=${encodeURIComponent(q)}` : ""}${category ? `&category=${category}` : ""}${tag ? `&tag=${tag}` : ""}`}
                  className="inline-flex items-center gap-1 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 transition shadow-xs"
                >
                  <ArrowLeft className="w-4 h-4" /> Previous
                </Link>
              ) : (
                <span className="inline-flex items-center gap-1 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-400 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-not-allowed opacity-60">
                  <ArrowLeft className="w-4 h-4" /> Previous
                </span>
              )}

              <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
                Page {currentPage} of {totalPages}
              </span>

              {currentPage < totalPages ? (
                <Link
                  href={`/blog?page=${currentPage + 1}${q ? `&q=${encodeURIComponent(q)}` : ""}${category ? `&category=${category}` : ""}${tag ? `&tag=${tag}` : ""}`}
                  className="inline-flex items-center gap-1 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 transition shadow-xs"
                >
                  Next <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <span className="inline-flex items-center gap-1 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-400 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-not-allowed opacity-60">
                  Next <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </div>
          )}

          {/* Newsletter Box */}
          <div className="mt-16">
            <NewsletterBox source="blog_listing" />
          </div>
        </div>
      </main>

      <Footer siteName={settings.siteName} tagline={settings.tagline} />
    </>
  );
}
