import { prisma } from "@/lib/prisma";
import { StaticPageLayout } from "@/components/StaticPageLayout";
import type { Metadata } from "next";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const page = await prisma.page.findUnique({ where: { slug: "terms" } });
  return {
    title: page?.metaTitle || "Terms & Conditions of Use",
    description: page?.metaDescription || "Review our terms and conditions governing use of our healthcare platform.",
  };
}

export default async function TermsPage() {
  const page = await prisma.page.findUnique({ where: { slug: "terms" } });

  return (
    <StaticPageLayout
      title={page?.title || "Terms and Conditions of Use"}
      slug="terms"
      content={page?.content || ""}
      updatedAt={page?.updatedAt}
      isLegalTemplate={true}
    />
  );
}
