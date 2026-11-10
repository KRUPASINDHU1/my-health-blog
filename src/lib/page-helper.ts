import { prisma } from "@/lib/prisma";

export async function getPage(slug: string) {
  try {
    return await prisma.page.findUnique({ where: { slug } });
  } catch (err) {
    console.warn(`Could not query page "${slug}" during build/render:`, err);
    return null;
  }
}
