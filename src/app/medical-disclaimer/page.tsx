import { prisma } from "@/lib/prisma";
import { StaticPageLayout } from "@/components/StaticPageLayout";
import type { Metadata } from "next";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const page = await prisma.page.findUnique({ where: { slug: "medical-disclaimer" } });
  return {
    title: page?.metaTitle || "Medical Disclaimer | Educational Healthcare Content",
    description: page?.metaDescription || "Read our formal medical disclaimer. Content is for educational purposes only and is not a substitute for professional clinical advice.",
  };
}

export default async function MedicalDisclaimerPage() {
  const page = await prisma.page.findUnique({ where: { slug: "medical-disclaimer" } });

  return (
    <StaticPageLayout
      title={page?.title || "Medical & Health Information Disclaimer"}
      slug="medical-disclaimer"
      content={page?.content || ""}
      updatedAt={page?.updatedAt}
      isLegalTemplate={true}
    />
  );
}
