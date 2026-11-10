/**
 * Calculates estimated reading time in minutes based on average 200 words per minute.
 */
export function calculateReadingTime(content: string): number {
  if (!content) return 1;
  // Strip HTML tags
  const plainText = content.replace(/<[^>]*>/g, " ").trim();
  const words = plainText.split(/\s+/).filter(Boolean).length;
  const minutes = Math.ceil(words / 200);
  return Math.max(1, minutes);
}
