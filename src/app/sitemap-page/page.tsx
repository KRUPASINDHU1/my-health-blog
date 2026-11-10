import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getSiteSettings } from "@/lib/settings";
import { Map, FileText, Folder, Users, Shield } from "lucide-react";

export const revalidate = 60;

export default async function HtmlSitemapPage() {
  const settings = await getSiteSettings();

  let posts: any[] = [];
  let categories: any[] = [];
  let authors: any[] = [];
  let pages: any[] = [];

  try {
    const res = await Promise.all([
      prisma.post.findMany({
        where: { status: "PUBLISHED" },
        select: { id: true, title: true, slug: true, publishedAt: true },
        orderBy: { publishedAt: "desc" },
      }),
      prisma.category.findMany({
        select: { id: true, name: true, slug: true },
        orderBy: { name: "asc" },
      }),
      prisma.author.findMany({
        select: { id: true, name: true, slug: true, credentials: true },
        orderBy: { name: "asc" },
      }),
      prisma.page.findMany({
        select: { id: true, title: true, slug: true },
      }),
    ]);
    posts = res[0];
    categories = res[1];
    authors = res[2];
    pages = res[3];
  } catch (err) {
    console.warn("Could not query sitemap items during build/render:", err);
  }

  return (
    <>
      <Header siteName={settings.siteName} />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 text-xs font-semibold mb-3">
            <Map className="w-3.5 h-3.5" /> Site Structure Index
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            HTML Sitemap &amp; Publication Directory
          </h1>
          <p className="mt-3 text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            A comprehensive, structured index of all published medical research articles, clinical focus categories, author directories, and institutional legal policies.
          </p>
        </div>

        <div className="space-y-12">
          {/* Main Website Sections */}
          <section className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
              <Folder className="w-5 h-5 text-teal-600" />
              Main Portals &amp; Overview
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              <li><Link href="/" className="text-teal-600 dark:text-teal-400 hover:underline">Home Page</Link></li>
              <li><Link href="/blog" className="text-teal-600 dark:text-teal-400 hover:underline">All Articles Archive</Link></li>
              <li><Link href="/categories" className="text-teal-600 dark:text-teal-400 hover:underline">Clinical Categories Index</Link></li>
              <li><Link href="/authors" className="text-teal-600 dark:text-teal-400 hover:underline">Medical Editorial Board</Link></li>
              <li><Link href="/about" className="text-teal-600 dark:text-teal-400 hover:underline">About Us</Link></li>
              <li><Link href="/contact" className="text-teal-600 dark:text-teal-400 hover:underline">Contact Editorial Desk</Link></li>
            </ul>
          </section>

          {/* Categories */}
          <section className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
              <Folder className="w-5 h-5 text-teal-600" />
              Clinical Categories ({categories.length})
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link href={`/category/${cat.slug}`} className="text-teal-600 dark:text-teal-400 hover:underline">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {/* Published Articles */}
          <section className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-teal-600" />
              Published Research Articles ({posts.length})
            </h2>
            <ul className="space-y-3 text-sm">
              {posts.map((post) => (
                <li key={post.id} className="border-b border-slate-100 dark:border-slate-800/80 pb-2">
                  <Link href={`/blog/${post.slug}`} className="font-medium text-slate-900 dark:text-slate-200 hover:text-teal-600 dark:hover:text-teal-400">
                    {post.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {/* Authors & Reviewers */}
          <section className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-teal-600" />
              Authors &amp; Peer Reviewers ({authors.length})
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              {authors.map((author) => (
                <li key={author.id}>
                  <Link href={`/author/${author.slug}`} className="text-teal-600 dark:text-teal-400 hover:underline">
                    {author.name} <span className="text-xs text-slate-400">({author.credentials})</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {/* Legal & Compliance Policies */}
          <section className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-teal-600" />
              Institutional &amp; Legal Policies ({pages.length})
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              {pages.map((p) => (
                <li key={p.id}>
                  <Link href={`/${p.slug}`} className="text-teal-600 dark:text-teal-400 hover:underline">
                    {p.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>

      <Footer siteName={settings.siteName} tagline={settings.tagline} />
    </>
  );
}
