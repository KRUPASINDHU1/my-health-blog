import { getPage } from "@/lib/page-helper";
import { StaticPageLayout } from "@/components/StaticPageLayout";
import type { Metadata } from "next";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("editorial-policy");
  return {
    title: page?.metaTitle || "Editorial Policy & Sourcing Standards",
    description: page?.metaDescription || "Discover our rigorous clinical review protocol, fact-checking processes, and peer-reviewed sourcing standards.",
  };
}

export default async function EditorialPolicyPage() {
  const page = await getPage("editorial-policy");

  return (
    <StaticPageLayout
      title={page?.title || "Editorial Policy & Clinical Review Standards"}
      slug="editorial-policy"
      content={page?.content || ""}
      updatedAt={page?.updatedAt}
      isLegalTemplate={false}
    />
  );
}
