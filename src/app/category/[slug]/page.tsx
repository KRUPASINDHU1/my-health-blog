import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PostCard } from "@/components/PostCard";
import { AdSlot } from "@/components/AdSlot";
import { getSiteSettings } from "@/lib/settings";
import { ChevronRight, Home } from "lucide-react";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const cat = await prisma.category.findUnique({ where: { slug } });
  if (!cat) return { title: "Category Not Found" };

  return {
    title: `${cat.name} Articles & Research`,
    description: cat.description || `Browse clinical articles, research updates, and innovations in ${cat.name}.`,
  };
}

export default async function CategoryArchivePage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      posts: {
        where: { status: "PUBLISHED" },
        include: {
          author: true,
          reviewedBy: true,
          categories: true,
        },
        orderBy: { publishedAt: "desc" },
      },
    },
  });

  if (!category) {
    notFound();
  }

  const settings = await getSiteSettings();

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

        {/* Category Header */}
        <section className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200/80 dark:border-slate-800 py-10 sm:py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-4">
              <Link href="/" className="hover:text-teal-600 flex items-center gap-1">
                <Home className="w-3.5 h-3.5" /> Home
              </Link>
              <ChevronRight className="w-3 h-3" />
              <Link href="/categories" className="hover:text-teal-600">
                Categories
              </Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-slate-800 dark:text-slate-200 font-medium">
                {category.name}
              </span>
            </nav>

            <div className="flex items-center gap-3 mb-2">
              <span
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: category.color }}
              />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Clinical Domain
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              {category.name}
            </h1>
            {category.description && (
              <p className="mt-3 text-base text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
                {category.description}
              </p>
            )}
          </div>
        </section>

        {/* Articles Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-6">
            Showing {category.posts.length} {category.posts.length === 1 ? "article" : "articles"} in {category.name}
          </p>

          {category.posts.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <p className="text-slate-600 dark:text-slate-400">
                No published articles currently in this category.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {category.posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer siteName={settings.siteName} tagline={settings.tagline} />
    </>
  );
}
