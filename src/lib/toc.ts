import { slugify } from "./utils";

export interface TocItem {
  id: string;
  text: string;
  level: number; // 2 or 3
}

/**
 * Extracts h2 and h3 headings from HTML content to form a Table of Contents.
 */
export function extractTableOfContents(html: string): TocItem[] {
  if (!html) return [];
  const headingRegex = /<h([23])[^>]*>(.*?)<\/h\1>/gi;
  const items: TocItem[] = [];
  let match;

  while ((match = headingRegex.exec(html)) !== null) {
    const level = parseInt(match[1], 10);
    // Strip nested tags inside heading
    const rawText = match[2].replace(/<[^>]*>/g, "").trim();
    if (rawText) {
      const id = slugify(rawText);
      items.push({ id, text: rawText, level });
    }
  }

  return items;
}

/**
 * Ensures h2 and h3 elements in HTML content have matching id attributes so TOC anchor links work.
 */
export function injectHeadingIds(html: string): string {
  if (!html) return "";
  return html.replace(/<h([23])([^>]*)>(.*?)<\/h\1>/gi, (fullMatch, level, attrs, text) => {
    // If id already exists, keep it
    if (attrs.includes("id=")) {
      return fullMatch;
    }
    const cleanText = text.replace(/<[^>]*>/g, "").trim();
    const id = slugify(cleanText);
    return `<h${level} id="${id}"${attrs}>${text}</h${level}>`;
  });
}
