import { prisma } from "@/lib/prisma";
import { StaticPageLayout } from "@/components/StaticPageLayout";
import type { Metadata } from "next";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const page = await prisma.page.findUnique({ where: { slug: "cookie-policy" } });
  return {
    title: page?.metaTitle || "Cookie Policy & Ad Tracking Disclosures",
    description: page?.metaDescription || "Learn how we use essential, analytics, and advertising cookies.",
  };
}

export default async function CookiePolicyPage() {
  const page = await prisma.page.findUnique({ where: { slug: "cookie-policy" } });

  return (
    <StaticPageLayout
      title={page?.title || "Cookie Policy"}
      slug="cookie-policy"
      content={page?.content || ""}
      updatedAt={page?.updatedAt}
      isLegalTemplate={true}
    />
  );
}
