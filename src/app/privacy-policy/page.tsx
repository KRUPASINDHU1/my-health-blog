import { getPage } from "@/lib/page-helper";
import { StaticPageLayout } from "@/components/StaticPageLayout";
import type { Metadata } from "next";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("privacy-policy");
  return {
    title: page?.metaTitle || "Privacy Policy | GDPR, CCPA & Google AdSense",
    description: page?.metaDescription || "Our privacy policy explains how data, cookies, Google AdSense ads, and analytics are handled.",
  };
}

export default async function PrivacyPolicyPage() {
  const page = await getPage("privacy-policy");

  return (
    <StaticPageLayout
      title={page?.title || "Privacy Policy"}
      slug="privacy-policy"
      content={page?.content || ""}
      updatedAt={page?.updatedAt}
      isLegalTemplate={true}
    />
  );
}
