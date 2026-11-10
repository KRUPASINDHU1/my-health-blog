import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PostCard } from "@/components/PostCard";
import { AdSlot } from "@/components/AdSlot";
import { TableOfContents } from "@/components/TableOfContents";
import { MedicalDisclaimerBox } from "@/components/MedicalDisclaimerBox";
import { ClinicalReviewBadge } from "@/components/ClinicalReviewBadge";
import { SourcesSection } from "@/components/SourcesSection";
import { ShareButtons } from "@/components/ShareButtons";
import { NewsletterBox } from "@/components/NewsletterBox";
import { extractTableOfContents, injectHeadingIds } from "@/lib/toc";
import { sanitizePostHtml } from "@/lib/sanitize";
import { formatDate } from "@/lib/utils";
import { getSiteSettings } from "@/lib/settings";
import { Clock, Calendar, ChevronRight, Home, ShieldCheck } from "lucide-react";

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.post.findUnique({
    where: { slug },
    include: { author: true, categories: true },
  });

  if (!post) return { title: "Post Not Found" };

  const settings = await getSiteSettings();
  const url = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/blog/${post.slug}`;

  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt,
    alternates: {
      canonical: post.canonicalUrl || url,
    },
    openGraph: {
      type: "article",
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt,
      url,
      images: [
        {
          url: post.ogImage || post.featuredImage,
          alt: post.featuredImageAlt || post.title,
        },
      ],
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt?.toISOString(),
      authors: [post.author.name],
      section: post.categories?.[0]?.name || "Healthcare",
    },
    twitter: {
      card: "summary_large_image",
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt,
      images: [post.ogImage || post.featuredImage],
    },
  };
}

export default async function SinglePostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = await prisma.post.findUnique({
    where: { slug },
    include: {
      author: true,
      reviewedBy: true,
      categories: true,
      tags: true,
    },
  });

  if (!post || post.status !== "PUBLISHED") {
    notFound();
  }

  // Increment view count asynchronously
  prisma.post.update({
    where: { id: post.id },
    data: { viewsCount: { increment: 1 } },
  }).catch(() => {});

  const settings = await getSiteSettings();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const postUrl = `${siteUrl}/blog/${post.slug}`;

  // Process HTML content
  const cleanHtml = sanitizePostHtml(post.content);
  const contentWithHeadingIds = injectHeadingIds(cleanHtml);
  const tocItems = extractTableOfContents(cleanHtml);

  // Split content at 2nd heading or paragraph for in-article ad slot placement
  const paragraphSplit = contentWithHeadingIds.indexOf("</p>", contentWithHeadingIds.indexOf("</p>") + 4);
  const hasParagraphSplit = paragraphSplit !== -1;
  const firstPart = hasParagraphSplit ? contentWithHeadingIds.substring(0, paragraphSplit + 4) : contentWithHeadingIds;
  const secondPart = hasParagraphSplit ? contentWithHeadingIds.substring(paragraphSplit + 4) : "";

  // Fetch related posts from same category
  const primaryCategoryId = post.categories?.[0]?.id;
  const relatedPosts = await prisma.post.findMany({
    where: {
      status: "PUBLISHED",
      id: { not: post.id },
      categories: primaryCategoryId ? { some: { id: primaryCategoryId } } : undefined,
    },
    include: {
      author: true,
      reviewedBy: true,
      categories: true,
    },
    take: 3,
  });

  // Schema.org MedicalWebPage JSON-LD for maximum clinical search authority
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    headline: post.title,
    description: post.excerpt,
    image: post.featuredImage,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt?.toISOString(),
    author: {
      "@type": "Person",
      name: post.author.name,
      jobTitle: post.author.title,
      url: `${siteUrl}/author/${post.author.slug}`,
    },
    ...(post.reviewedBy && {
      reviewedBy: {
        "@type": "Person",
        name: post.reviewedBy.name,
        jobTitle: post.reviewedBy.title,
        url: `${siteUrl}/author/${post.reviewedBy.slug}`,
      },
    }),
    publisher: {
      "@type": "MedicalOrganization",
      name: settings.siteName,
      url: siteUrl,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": postUrl,
    },
  };

  return (
    <>
      <Header siteName={settings.siteName} />

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

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

        {/* Breadcrumb Navigation */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Link href="/" className="hover:text-teal-600 flex items-center gap-1">
              <Home className="w-3.5 h-3.5" />
              Home
            </Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/blog" className="hover:text-teal-600">
              Articles
            </Link>
            {post.categories?.[0] && (
              <>
                <ChevronRight className="w-3 h-3" />
                <Link href={`/category/${post.categories[0].slug}`} className="hover:text-teal-600">
                  {post.categories[0].name}
                </Link>
              </>
            )}
            <ChevronRight className="w-3 h-3" />
            <span className="truncate max-w-[200px] text-slate-800 dark:text-slate-200">
              {post.title}
            </span>
          </nav>
        </div>

        {/* Article Header */}
        <article className="max-w-4xl mx-auto px-4 sm:px-6 mt-6">
          <header className="space-y-4">
            {/* Category Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {post.categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  className="px-3 py-1 rounded-full text-xs font-bold text-white shadow-xs"
                  style={{ backgroundColor: cat.color || "#0d9488" }}
                >
                  {cat.name}
                </Link>
              ))}
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.2]">
              {post.title}
            </h1>

            {/* Excerpt */}
            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed font-serif">
              {post.excerpt}
            </p>

            {/* Author, Reviewer & Timing Metadata */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Link href={`/author/${post.author.slug}`}>
                  <div className="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-teal-500/30">
                    <Image
                      src={post.author.avatar}
                      alt={post.author.name}
                      fill
                      unoptimized
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
                </Link>
                <div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/author/${post.author.slug}`}
                      className="text-sm font-bold text-slate-900 dark:text-white hover:text-teal-600"
                    >
                      {post.author.name}
                    </Link>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {post.author.credentials}
                  </p>
                </div>
              </div>

              {/* Clinical Reviewer Badge */}
              {post.reviewedBy && (
                <ClinicalReviewBadge reviewer={post.reviewedBy} />
              )}
            </div>

            {/* Dates & Read Time Bar */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-2 pb-4 border-b border-slate-100 dark:border-slate-800">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Published: {formatDate(post.publishedAt)}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {post.readingTime} min read
              </span>
              <span>•</span>
              <span className="text-teal-700 dark:text-teal-400 font-medium">
                Last Clinically Updated: {formatDate(post.updatedAt)}
              </span>
            </div>
          </header>

          {/* Social Share Buttons */}
          <ShareButtons title={post.title} url={postUrl} />

          {/* Prominent Medical Disclaimer Box (Requirement 3: Visible Medical Disclaimer Box) */}
          <MedicalDisclaimerBox />

          {/* Featured Hero Image */}
          <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 my-8 shadow-md">
            <Image
              src={post.featuredImage}
              alt={post.featuredImageAlt || post.title}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 896px"
            />
            {post.featuredImageAlt && (
              <div className="absolute bottom-0 inset-x-0 p-2.5 bg-slate-950/70 text-slate-200 text-xs text-center backdrop-blur-xs">
                {post.featuredImageAlt}
              </div>
            )}
          </div>

          {/* Table of Contents */}
          <TableOfContents items={tocItems} />

          {/* Body Content with In-Article Ad Slot */}
          <div className="prose dark:prose-invert prose-teal max-w-none prose-headings:text-slate-900 dark:prose-headings:text-white prose-p:text-slate-700 dark:prose-p:text-slate-300">
            {/* First half of content */}
            <div dangerouslySetInnerHTML={{ __html: firstPart }} />

            {/* In-Article Ad Slot after 2nd paragraph */}
            {hasParagraphSplit && settings.adsEnabled && settings.adSlots.inArticle && (
              <div className="not-prose my-8">
                <AdSlot
                  placement="inArticle"
                  publisherId={settings.adsensePublisherId}
                  adsEnabled={settings.adsEnabled}
                />
              </div>
            )}

            {/* Remaining content */}
            {hasParagraphSplit && (
              <div dangerouslySetInnerHTML={{ __html: secondPart }} />
            )}
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Related Tags:</span>
              {post.tags.map((tag) => (
                <Link
                  key={tag.id}
                  href={`/tag/${tag.slug}`}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-teal-50 hover:text-teal-600 transition"
                >
                  #{tag.name}
                </Link>
              ))}
            </div>
          )}

          {/* Sources and References Section */}
          <SourcesSection sourcesJson={post.sources} />

          {/* Share Buttons at bottom */}
          <ShareButtons title={post.title} url={postUrl} />

          {/* End of Post Ad Slot */}
          {settings.adsEnabled && settings.adSlots.endOfPost && (
            <div className="my-8">
              <AdSlot
                placement="endOfPost"
                publisherId={settings.adsensePublisherId}
                adsEnabled={settings.adsEnabled}
              />
            </div>
          )}

          {/* Author Bio Card */}
          <div className="my-10 p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center sm:items-start gap-6 shadow-sm">
            <Link href={`/author/${post.author.slug}`}>
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden shrink-0 ring-4 ring-teal-500/20">
                <Image
                  src={post.author.avatar}
                  alt={post.author.name}
                  fill
                  unoptimized
                  className="object-cover"
                  sizes="96px"
                />
              </div>
            </Link>

            <div className="space-y-2 text-center sm:text-left flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                    <Link href={`/author/${post.author.slug}`} className="hover:text-teal-600">
                      {post.author.name}
                    </Link>
                  </h4>
                  <p className="text-xs text-teal-600 dark:text-teal-400 font-medium">
                    {post.author.credentials}
                  </p>
                </div>
                <Link
                  href={`/author/${post.author.slug}`}
                  className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline"
                >
                  View Author Profile &amp; Articles →
                </Link>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {post.author.bio}
              </p>
            </div>
          </div>

          {/* Newsletter Box */}
          <div className="my-10">
            <NewsletterBox source={`post_${post.slug}`} />
          </div>

          {/* Related Articles */}
          {relatedPosts.length > 0 && (
            <section className="my-12">
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mb-6">
                Related Clinical Articles
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {relatedPosts.map((related) => (
                  <PostCard key={related.id} post={related} />
                ))}
              </div>
            </section>
          )}
        </article>
      </main>

      <Footer siteName={settings.siteName} tagline={settings.tagline} />
    </>
  );
}
