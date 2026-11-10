import { BookOpen, ExternalLink } from "lucide-react";

export interface SourceItem {
  title: string;
  url: string;
  citation?: string;
  doi?: string;
}

interface SourcesSectionProps {
  sourcesJson?: string | null;
}

export function SourcesSection({ sourcesJson }: SourcesSectionProps) {
  if (!sourcesJson) return null;

  let sources: SourceItem[] = [];
  try {
    sources = JSON.parse(sourcesJson);
  } catch {
    return null;
  }

  if (!sources || sources.length === 0) return null;

  return (
    <section
      className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800"
      aria-label="Peer-Reviewed Sources and References"
    >
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-5 h-5 text-teal-600 dark:text-teal-400" />
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          Scientific Sources &amp; Peer-Reviewed References
        </h3>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
        Our clinical team adheres to strict sourcing guidelines. We rely exclusively on peer-reviewed biomedical literature, academic clinical trials, and governmental health regulatory agencies.
      </p>

      <ol className="space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300 list-decimal list-inside">
        {sources.map((source, index) => (
          <li key={index} className="leading-relaxed pl-1">
            <span className="font-medium text-slate-900 dark:text-white">
              {source.title}
            </span>
            {source.citation && (
              <span className="text-slate-500 dark:text-slate-400">
                {" "}— {source.citation}
              </span>
            )}
            {source.url && (
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-teal-600 dark:text-teal-400 hover:underline ml-1.5 font-medium"
              >
                [View Source <ExternalLink className="w-3 h-3" />]
              </a>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
