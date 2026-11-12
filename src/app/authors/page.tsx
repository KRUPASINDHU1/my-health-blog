import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getSiteSettings } from "@/lib/settings";
import { Stethoscope, ShieldCheck, ArrowRight, ExternalLink } from "lucide-react";

export const revalidate = 60;

export default async function AuthorsPage() {
  const settings = await getSiteSettings();

  let authors: any[] = [];
  try {
    authors = await prisma.author.findMany({
      include: {
        _count: {
          select: {
            posts: { where: { status: "PUBLISHED" } },
            reviewedPosts: { where: { status: "PUBLISHED" } },
          },
        },
      },
      orderBy: { name: "asc" },
    });
  } catch (err) {
    console.warn("Could not query authors during build/render:", err);
  }

  return (
    <>
      <Header siteName={settings.siteName} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 text-xs font-semibold mb-3">
            <Stethoscope className="w-3.5 h-3.5" />
            Editorial Board &amp; Technical Review
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            Our Medical Experts
          </h1>
          <p className="mt-3 text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            Our articles are authored and peer-reviewed by licensed physicians, pharmacologists, and biomedical researchers dedicated to uncompromising scientific precision and patient safety.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {authors.map((author) => (
            <div
              key={author.id}
              className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between shadow-xs hover:shadow-xl transition-all"
            >
              <div>
                <div className="relative w-24 h-24 rounded-2xl overflow-hidden ring-4 ring-teal-500/20 mb-6 shadow-md">
                  <Image
                    src={author.avatar}
                    alt={author.name}
                    fill
                    unoptimized
                    className="object-cover"
                    sizes="96px"
                  />
                </div>

                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 text-[11px] font-bold mb-2">
                  <ShieldCheck className="w-3.5 h-3.5" />{" "}
                  {author.name?.toLowerCase().includes("krupasindhu") || author.slug?.includes("krupasindhu")
                    ? "Verified Researcher"
                    : "Verified Clinician"}
                </div>

                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  <Link href={`/author/${author.slug}`} className="hover:text-teal-600">
                    {author.name}
                  </Link>
                </h3>
                <p className="text-xs font-semibold text-teal-600 dark:text-teal-400 mt-1">
                  {author.credentials}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {author.title}
                </p>

                <p className="mt-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-4">
                  {author.bio}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-500">
                  {author._count.posts} {author._count.posts === 1 ? "Article" : "Articles"}
                  {author._count.reviewedPosts > 0 && ` • ${author._count.reviewedPosts} Reviewed`}
                </span>
                <Link
                  href={`/author/${author.slug}`}
                  className="font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
                >
                  Full Bio <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer siteName={settings.siteName} tagline={settings.tagline} />
    </>
  );
}
