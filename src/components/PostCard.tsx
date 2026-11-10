import Link from "next/link";
import Image from "next/image";
import { Clock, Calendar, CheckCircle2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface AuthorProps {
  name: string;
  slug: string;
  avatar: string;
  credentials?: string;
}

interface CategoryProps {
  name: string;
  slug: string;
  color?: string;
}

export interface PostCardProps {
  post: {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    featuredImage: string;
    featuredImageAlt?: string;
    publishedAt: Date | string | null;
    readingTime: number;
    author: AuthorProps;
    reviewedBy?: AuthorProps | null;
    categories: CategoryProps[];
  };
  priority?: boolean;
  aspectRatio?: "video" | "wide";
}

export function PostCard({ post, priority = false }: PostCardProps) {
  const primaryCategory = post.categories?.[0];

  return (
    <article className="group flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-xl hover:border-teal-500/30 transition-all duration-300">
      {/* Featured Image */}
      <Link href={`/blog/${post.slug}`} className="relative block aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-800">
        <Image
          src={post.featuredImage}
          alt={post.featuredImageAlt || post.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={priority}
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {primaryCategory && (
          <span
            className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-bold text-white shadow-sm backdrop-blur-md"
            style={{ backgroundColor: primaryCategory.color || "#0d9488" }}
          >
            {primaryCategory.name}
          </span>
        )}
      </Link>

      {/* Content Area */}
      <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between">
        <div>
          {/* Metadata: Date and Reading Time */}
          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mb-2.5">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(post.publishedAt)}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {post.readingTime} min read
            </span>
          </div>

          {/* Title */}
          <h3 className="font-bold text-lg sm:text-xl text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors line-clamp-2 leading-snug">
            <Link href={`/blog/${post.slug}`}>
              {post.title}
            </Link>
          </h3>

          {/* Excerpt */}
          <p className="mt-2.5 text-sm text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
            {post.excerpt}
          </p>
        </div>

        {/* Footer: Author & Reviewer */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <Link
            href={`/author/${post.author.slug}`}
            className="flex items-center gap-2.5 group/author"
          >
            <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 ring-1 ring-slate-200 dark:ring-slate-700">
              <Image
                src={post.author.avatar}
                alt={post.author.name}
                fill
                unoptimized
                className="object-cover"
                sizes="32px"
              />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-900 dark:text-white group-hover/author:text-teal-600 transition">
                {post.author.name}
              </p>
              {post.author.credentials && (
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[150px]">
                  {post.author.credentials}
                </p>
              )}
            </div>
          </Link>

          {post.reviewedBy && (
            <span
              className="text-[11px] font-medium text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-full flex items-center gap-1"
              title={`Medically reviewed by ${post.reviewedBy.name}`}
            >
              <CheckCircle2 className="w-3 h-3 text-teal-600 dark:text-teal-400 shrink-0" />
              <span className="hidden sm:inline">Reviewed</span>
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
