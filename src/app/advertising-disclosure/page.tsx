import { getPage } from "@/lib/page-helper";
import { StaticPageLayout } from "@/components/StaticPageLayout";
import type { Metadata } from "next";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("advertising-disclosure");
  return {
    title: page?.metaTitle || "Advertising & Affiliate Disclosure",
    description: page?.metaDescription || "Our transparent advertising policy explains how ads and affiliate links are demarcated from editorial content.",
  };
}

export default async function AdvertisingDisclosurePage() {
  const page = await getPage("advertising-disclosure");

  return (
    <StaticPageLayout
      title={page?.title || "Advertising & Affiliate Disclosure"}
      slug="advertising-disclosure"
      content={page?.content || ""}
      updatedAt={page?.updatedAt}
      isLegalTemplate={true}
    />
  );
}
