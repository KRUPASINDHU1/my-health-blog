import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getSiteSettings } from "@/lib/settings";
import { formatDate } from "@/lib/utils";
import { FileText, ChevronRight, Home } from "lucide-react";
import Link from "next/link";

interface StaticPageLayoutProps {
  title: string;
  slug: string;
  content: string;
  updatedAt?: Date | string;
  isLegalTemplate?: boolean;
}

export async function StaticPageLayout({
  title,
  slug,
  content,
  updatedAt,
  isLegalTemplate = true,
}: StaticPageLayoutProps) {
  const settings = await getSiteSettings();

  return (
    <>
      <Header siteName={settings.siteName} />

      <main className="flex-1 pb-16">
        <section className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200/80 dark:border-slate-800 py-10 sm:py-14">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-4">
              <Link href="/" className="hover:text-teal-600 flex items-center gap-1">
                <Home className="w-3.5 h-3.5" /> Home
              </Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-slate-800 dark:text-slate-200 font-medium">
                {title}
              </span>
            </nav>

            <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 text-xs font-bold uppercase tracking-wider mb-2">
              <FileText className="w-4 h-4" />
              Institutional &amp; Legal Policy
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              {title}
            </h1>

            {updatedAt && (
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                Effective &amp; Last Updated: {formatDate(updatedAt)}
              </p>
            )}
          </div>
        </section>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-10">
          <div
            className="prose dark:prose-invert prose-teal max-w-none prose-headings:text-slate-900 dark:prose-headings:text-white prose-p:text-slate-700 dark:prose-p:text-slate-300"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      </main>

      <Footer siteName={settings.siteName} tagline={settings.tagline} />
    </>
  );
}
