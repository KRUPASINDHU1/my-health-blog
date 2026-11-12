import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PostCard } from "@/components/PostCard";
import { getSiteSettings } from "@/lib/settings";
import { ShieldCheck, Mail, Twitter, Linkedin, ChevronRight, Home } from "lucide-react";

interface AuthorPageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;
export const dynamicParams = true;

export async function generateMetadata({ params }: AuthorPageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const author = await prisma.author.findUnique({ where: { slug } });
    if (!author) return { title: "Author Not Found | HealthTech Spectrum" };

    return {
      title: `${author.name} (${author.credentials}) | Clinical Bio & Articles`,
      description: author.bio,
      openGraph: {
        title: `${author.name} | Medical Editorial Board`,
        description: author.bio,
        images: [{ url: author.avatar }],
      },
    };
  } catch {
    return { title: "Author | HealthTech Spectrum" };
  }
}

export default async function SingleAuthorPage({ params }: AuthorPageProps) {
  const { slug } = await params;
  let author = null;

  try {
    author = await prisma.author.findUnique({
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
        reviewedPosts: {
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
  } catch (err) {
    console.error(`Error loading author "${slug}":`, err);
  }

  if (!author) {
    notFound();
  }

  const settings = await getSiteSettings();

  // Author Person Schema JSON-LD
  const authorSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: author.name,
    jobTitle: author.title,
    description: author.bio,
    image: author.avatar,
    sameAs: [
      author.socialTwitter,
      author.socialLinkedin,
    ].filter(Boolean),
    worksFor: {
      "@type": "MedicalOrganization",
      name: settings.siteName,
    },
  };

  return (
    <>
      <Header siteName={settings.siteName} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(authorSchema) }}
      />

      <main className="flex-1 pb-16">
        {/* Author Profile Header */}
        <section className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200/80 dark:border-slate-800 py-12 sm:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-6">
              <Link href="/" className="hover:text-teal-600 flex items-center gap-1">
                <Home className="w-3.5 h-3.5" /> Home
              </Link>
              <ChevronRight className="w-3 h-3" />
              <Link href="/authors" className="hover:text-teal-600">
                Authors &amp; Reviewers
              </Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-slate-800 dark:text-slate-200 font-medium">
                {author.name}
              </span>
            </nav>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8 text-center sm:text-left">
              <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-3xl overflow-hidden ring-4 ring-teal-500/20 shadow-xl shrink-0">
                <Image
                  src={author.avatar}
                  alt={author.name}
                  fill
                  priority
                  unoptimized
                  className="object-cover"
                  sizes="(max-width: 640px) 112px, 144px"
                />
              </div>

              <div className="space-y-3 flex-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100/80 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 text-xs font-bold">
                  <ShieldCheck className="w-4 h-4 text-teal-600" />
                  {author.name?.toLowerCase().includes("krupasindhu") || author.slug?.includes("krupasindhu")
                    ? "Verified Researcher"
                    : "Verified Medical Contributor"}
                </div>

                <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
                  {author.name}
                </h1>

                <p className="text-sm font-semibold text-teal-600 dark:text-teal-400">
                  {author.credentials}
                </p>

                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                  {author.title}
                </p>

                <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed pt-2">
                  {author.bio}
                </p>

                {/* Social & Contact Links */}
                <div className="pt-3 flex flex-wrap items-center justify-center sm:justify-start gap-3">
                  {author.socialTwitter && (
                    <a
                      href={author.socialTwitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-teal-600 transition shadow-xs"
                    >
                      <Twitter className="w-3.5 h-3.5" /> Twitter / X
                    </a>
                  )}
                  {author.socialLinkedin && (
                    <a
                      href={author.socialLinkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-teal-600 transition shadow-xs"
                    >
                      <Linkedin className="w-3.5 h-3.5" /> LinkedIn
                    </a>
                  )}
                  {author.email && (
                    <a
                      href={`mailto:${author.email}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-teal-600 transition shadow-xs"
                    >
                      <Mail className="w-3.5 h-3.5" /> Email
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Authored Articles */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mb-6">
            Articles Authored by {author.name} ({author.posts.length})
          </h2>

          {author.posts.length === 0 ? (
            <p className="text-slate-500 text-sm">No published articles yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {author.posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}

          {/* Medically Reviewed Articles */}
          {author.reviewedPosts.length > 0 && (
            <section className="mt-16 pt-12 border-t border-slate-200 dark:border-slate-800">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mb-6">
                Articles Medically Reviewed by {author.name} ({author.reviewedPosts.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {author.reviewedPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer siteName={settings.siteName} tagline={settings.tagline} />
    </>
  );
}
