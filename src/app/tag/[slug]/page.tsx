import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PostCard } from "@/components/PostCard";
import { getSiteSettings } from "@/lib/settings";
import { Tag as TagIcon, ChevronRight, Home } from "lucide-react";

interface TagPageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const { slug } = await params;
  const tag = await prisma.tag.findUnique({ where: { slug } });
  if (!tag) return { title: "Tag Not Found" };

  return {
    title: `Articles tagged #${tag.name}`,
    description: `Browse all medical and healthcare articles tagged with #${tag.name}.`,
  };
}

export default async function TagArchivePage({ params }: TagPageProps) {
  const { slug } = await params;
  const tag = await prisma.tag.findUnique({
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

  if (!tag) {
    notFound();
  }

  const settings = await getSiteSettings();

  return (
    <>
      <Header siteName={settings.siteName} />

      <main className="flex-1 pb-16">
        <section className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200/80 dark:border-slate-800 py-10 sm:py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-4">
              <Link href="/" className="hover:text-teal-600 flex items-center gap-1">
                <Home className="w-3.5 h-3.5" /> Home
              </Link>
              <ChevronRight className="w-3 h-3" />
              <Link href="/blog" className="hover:text-teal-600">
                Articles
              </Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-slate-800 dark:text-slate-200 font-medium">
                #{tag.name}
              </span>
            </nav>

            <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 text-xs font-bold uppercase tracking-wider mb-2">
              <TagIcon className="w-4 h-4" />
              Topic Tag
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              #{tag.name}
            </h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Showing all articles and clinical analyses labeled with this tag
            </p>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tag.posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      </main>

      <Footer siteName={settings.siteName} tagline={settings.tagline} />
    </>
  );
}
