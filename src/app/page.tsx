import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PostCard } from "@/components/PostCard";
import { AdSlot } from "@/components/AdSlot";
import { NewsletterBox } from "@/components/NewsletterBox";
import { MedicalDisclaimerBox } from "@/components/MedicalDisclaimerBox";
import { getSiteSettings } from "@/lib/settings";
import {
  Activity,
  ArrowRight,
  Search,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Stethoscope,
  BookOpen,
} from "lucide-react";

export const revalidate = 60; // ISR cache revalidation

export default async function HomePage() {
  const settings = await getSiteSettings();

  // Fetch posts and categories with build-safe try/catch
  let featuredPost = null;
  let latestPosts: any[] = [];
  let popularPosts: any[] = [];
  let categories: any[] = [];

  try {
    featuredPost = await prisma.post.findFirst({
      where: { status: "PUBLISHED", isFeatured: true },
      include: {
        author: true,
        reviewedBy: true,
        categories: true,
      },
      orderBy: { publishedAt: "desc" },
    });

    latestPosts = await prisma.post.findMany({
      where: {
        status: "PUBLISHED",
        id: featuredPost ? { not: featuredPost.id } : undefined,
      },
      include: {
        author: true,
        reviewedBy: true,
        categories: true,
      },
      orderBy: { publishedAt: "desc" },
      take: 6,
    });

    popularPosts = await prisma.post.findMany({
      where: { status: "PUBLISHED" },
      include: {
        author: true,
        categories: true,
      },
      orderBy: { viewsCount: "desc" },
      take: 4,
    });

    categories = await prisma.category.findMany({
      orderBy: { order: "asc" },
      include: {
        _count: {
          select: { posts: { where: { status: "PUBLISHED" } } },
        },
      },
    });
  } catch (err) {
    console.warn("Could not query database during build/render, using empty defaults:", err);
  }

  return (
    <>
      <Header siteName={settings.siteName} />

      <main className="flex-1 pb-16">
        {/* Top Header Banner Ad Slot */}
        {settings.adsEnabled && settings.adSlots.headerBanner && (
          <div className="max-w-7xl mx-auto px-4 pt-4 sm:pt-6">
            <AdSlot
              placement="headerBanner"
              publisherId={settings.adsensePublisherId}
              adsEnabled={settings.adsEnabled}
            />
          </div>
        )}

        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-teal-50/70 via-white to-white dark:from-slate-900 dark:via-slate-950 dark:to-slate-950 py-12 sm:py-20 border-b border-slate-100 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center space-y-5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-100/80 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 text-xs font-semibold tracking-wide border border-teal-200 dark:border-teal-800">
                <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>Peer-Reviewed Clinical Science &amp; Health Tech</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
                {settings.tagline}
              </h1>

              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
                Discover actionable medical research, clinical pharmacology breakthroughs, circadian science, and health technology curated by licensed physicians.
              </p>

              {/* Live Search Bar */}
              <form action="/blog" method="GET" className="relative max-w-xl mx-auto pt-2">
                <div className="relative">
                  <input
                    type="search"
                    name="q"
                    placeholder="Search clinical topics, mRNA vaccines, cardiology, AI in healthcare..."
                    className="w-full pl-12 pr-28 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-lg text-sm sm:text-base"
                  />
                  <Search className="w-5 h-5 text-slate-400 absolute left-4 top-4" />
                  <button
                    type="submit"
                    className="absolute right-2 top-2 px-5 py-2 text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-sm transition"
                  >
                    Search
                  </button>
                </div>
              </form>

              {/* Trust Badges (Important for E-E-A-T and AdSense) */}
              <div className="pt-4 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-teal-600" />
                  Board-Certified Physician Review
                </span>
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-teal-600" />
                  Peer-Reviewed Citations
                </span>
                <span className="flex items-center gap-1.5">
                  <Stethoscope className="w-4 h-4 text-teal-600" />
                  Evidence-Based Medicine
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content Layout */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
          {/* Featured Post Showcase */}
          {featuredPost && (
            <section className="mb-16">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-teal-600" />
                  Featured Editorial Investigation
                </h2>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                  Lead Clinical Article
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-sm hover:shadow-xl transition-all">
                <div className="lg:col-span-7 relative aspect-[16/10] rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <Image
                    src={featuredPost.featuredImage}
                    alt={featuredPost.featuredImageAlt || featuredPost.title}
                    fill
                    priority
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 60vw"
                  />
                  {featuredPost.categories?.[0] && (
                    <span
                      className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold text-white shadow-md backdrop-blur-md"
                      style={{ backgroundColor: featuredPost.categories[0].color || "#0d9488" }}
                    >
                      {featuredPost.categories[0].name}
                    </span>
                  )}
                </div>

                <div className="lg:col-span-5 space-y-4">
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span>{featuredPost.readingTime} min read</span>
                    <span>•</span>
                    <span>Evidence-Based Review</span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white hover:text-teal-600 dark:hover:text-teal-400 transition leading-tight">
                    <Link href={`/blog/${featuredPost.slug}`}>
                      {featuredPost.title}
                    </Link>
                  </h3>

                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                    {featuredPost.excerpt}
                  </p>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <Link
                      href={`/author/${featuredPost.author.slug}`}
                      className="flex items-center gap-3"
                    >
                      <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 ring-2 ring-teal-500/30">
                        <Image
                          src={featuredPost.author.avatar}
                          alt={featuredPost.author.name}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                          {featuredPost.author.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {featuredPost.author.credentials}
                        </p>
                      </div>
                    </Link>

                    <Link
                      href={`/blog/${featuredPost.slug}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 transition shadow-sm"
                    >
                      Read Full Article
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Categories Grid */}
          <section className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                  Explore by Clinical Focus
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Browse research across six specialized domains of healthcare
                </p>
              </div>
              <Link
                href="/categories"
                className="text-xs sm:text-sm font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
              >
                All Categories <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  className="group p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-teal-500 hover:shadow-lg transition-all flex flex-col justify-between"
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white mb-3 text-xs font-bold"
                    style={{ backgroundColor: cat.color }}
                  >
                    {cat.name.slice(0, 1)}
                  </div>
                  <div>
                    <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-teal-600 transition">
                      {cat.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {cat._count.posts} {cat._count.posts === 1 ? "article" : "articles"}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Middle In-Feed Ad Slot */}
          {settings.adsEnabled && settings.adSlots.inArticle && (
            <div className="my-8">
              <AdSlot
                placement="inArticle"
                publisherId={settings.adsensePublisherId}
                adsEnabled={settings.adsEnabled}
              />
            </div>
          )}

          {/* Latest Articles & Popular Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-16">
            {/* Latest Articles (Col 8) */}
            <section className="lg:col-span-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                  Latest Published Research
                </h2>
                <Link
                  href="/blog"
                  className="text-xs sm:text-sm font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
                >
                  View All Articles <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {latestPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            </section>

            {/* Sidebar (Col 4) */}
            <aside className="lg:col-span-4 space-y-8">
              {/* Trending Posts Widget */}
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <TrendingUp className="w-4 h-4 text-teal-600" />
                  Most Read Articles
                </h3>

                <div className="space-y-4">
                  {popularPosts.map((p, idx) => (
                    <div key={p.id} className="flex items-start gap-3 group">
                      <span className="text-xl font-extrabold text-slate-300 dark:text-slate-700 font-mono shrink-0">
                        0{idx + 1}
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-teal-600 transition line-clamp-2 leading-snug">
                          <Link href={`/blog/${p.slug}`}>{p.title}</Link>
                        </h4>
                        <p className="text-xs text-slate-400 mt-1">
                          By {p.author.name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sidebar Ad Slot */}
              {settings.adsEnabled && settings.adSlots.sidebar && (
                <AdSlot
                  placement="sidebar"
                  publisherId={settings.adsensePublisherId}
                  adsEnabled={settings.adsEnabled}
                />
              )}

              {/* Medical Trust Box */}
              <div className="p-5 rounded-2xl bg-teal-50/60 dark:bg-teal-950/40 border border-teal-200/60 dark:border-teal-900 text-teal-950 dark:text-teal-200 space-y-2.5">
                <div className="flex items-center gap-2 text-teal-800 dark:text-teal-300 font-bold text-sm">
                  <ShieldCheck className="w-4 h-4 text-teal-600" />
                  Our Clinical Quality Guarantee
                </div>
                <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                  We maintain strict firewall separation between our advertising and editorial teams. No advertiser influences our medical reviews or article content.
                </p>
                <Link
                  href="/editorial-policy"
                  className="inline-block text-xs font-bold text-teal-700 dark:text-teal-300 underline hover:text-teal-900"
                >
                  Read our Editorial Standards →
                </Link>
              </div>
            </aside>
          </div>

          {/* Medical Disclaimer Banner */}
          <MedicalDisclaimerBox />

          {/* Newsletter Box */}
          <div className="my-16">
            <NewsletterBox source="homepage_main" />
          </div>

          {/* End of Page Ad Slot */}
          {settings.adsEnabled && settings.adSlots.endOfPost && (
            <div className="my-8">
              <AdSlot
                placement="endOfPost"
                publisherId={settings.adsensePublisherId}
                adsEnabled={settings.adsEnabled}
              />
            </div>
          )}
        </div>
      </main>

      <Footer siteName={settings.siteName} tagline={settings.tagline} />
    </>
  );
}
