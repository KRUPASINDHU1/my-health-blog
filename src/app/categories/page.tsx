import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getSiteSettings } from "@/lib/settings";
import { ArrowRight, Layers } from "lucide-react";

export const revalidate = 60;

export default async function CategoriesPage() {
  const settings = await getSiteSettings();

  let categories: any[] = [];
  try {
    categories = await prisma.category.findMany({
      orderBy: { order: "asc" },
      include: {
        _count: {
          select: { posts: { where: { status: "PUBLISHED" } } },
        },
      },
    });
  } catch (err) {
    console.warn("Could not query categories during build/render:", err);
  }

  return (
    <>
      <Header siteName={settings.siteName} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 text-xs font-semibold mb-3">
            <Layers className="w-3.5 h-3.5" />
            Specialized Medical Taxonomy
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            Clinical Categories &amp; Topics
          </h1>
          <p className="mt-3 text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            Our evidence-based research articles are classified into six focused domains, covering emerging medical technologies to public health epidemiology.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="group p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-teal-500 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg mb-6 shadow-md"
                  style={{ backgroundColor: cat.color }}
                >
                  {cat.name.slice(0, 1)}
                </div>

                <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-teal-600 transition-colors">
                  {cat.name}
                </h3>

                <p className="mt-2.5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {cat.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-400">
                  {cat._count.posts} {cat._count.posts === 1 ? "Article" : "Articles"}
                </span>
                <span className="text-teal-600 dark:text-teal-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  Explore Topic <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <Footer siteName={settings.siteName} tagline={settings.tagline} />
    </>
  );
}
