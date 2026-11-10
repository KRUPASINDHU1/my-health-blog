import Link from "next/link";
import Image from "next/image";
import { CheckCircle2 } from "lucide-react";

interface ClinicalReviewBadgeProps {
  reviewer?: {
    id: string;
    name: string;
    slug: string;
    credentials: string;
    avatar: string;
  } | null;
}

export function ClinicalReviewBadge({ reviewer }: ClinicalReviewBadgeProps) {
  if (!reviewer) return null;

  return (
    <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 text-teal-900 dark:text-teal-200 text-xs font-medium">
      <div className="relative w-5 h-5 rounded-full overflow-hidden shrink-0 ring-1 ring-teal-500/30">
        <Image
          src={reviewer.avatar}
          alt={reviewer.name}
          fill
          className="object-cover"
          sizes="20px"
        />
      </div>
      <div className="flex items-center gap-1.5">
        <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
        <span>
          Medically Reviewed by{" "}
          <Link
            href={`/author/${reviewer.slug}`}
            className="font-bold underline hover:text-teal-700 dark:hover:text-teal-300"
          >
            {reviewer.name}
          </Link>{" "}
          <span className="text-[11px] opacity-80">({reviewer.credentials})</span>
        </span>
      </div>
    </div>
  );
}
