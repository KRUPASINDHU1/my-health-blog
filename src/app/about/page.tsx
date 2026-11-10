import { prisma } from "@/lib/prisma";
import { StaticPageLayout } from "@/components/StaticPageLayout";
import type { Metadata } from "next";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const page = await prisma.page.findUnique({ where: { slug: "about" } });
  return {
    title: page?.metaTitle || "About Us | Clinical Editorial Mission",
    description: page?.metaDescription || "Learn about our healthcare publication, our medical editorial board, and our commitment to evidence-based science.",
  };
}

export default async function AboutPage() {
  const page = await prisma.page.findUnique({ where: { slug: "about" } });

  return (
    <StaticPageLayout
      title={page?.title || "About Our Healthcare Publication"}
      slug="about"
      content={page?.content || "<p>Our mission is to deliver evidence-based clinical insights.</p>"}
      updatedAt={page?.updatedAt}
      isLegalTemplate={false}
    />
  );
}
