import { prisma } from "./prisma";
import { siteConfig } from "@/config/site";

export interface ResolvedSiteSettings {
  siteName: string;
  tagline: string;
  description: string;
  logoUrl?: string;
  footerText?: string;
  contactEmail?: string;
  contactAddress?: string;
  contactPhone?: string;
  googleAnalyticsId?: string;
  adsensePublisherId?: string;
  adsTxtContent?: string;
  adsEnabled: boolean;
  adSlots: {
    headerBanner: boolean;
    inArticle: boolean;
    sidebar: boolean;
    endOfPost: boolean;
    stickyMobileFooter: boolean;
  };
  social: {
    twitter?: string;
    linkedin?: string;
    facebook?: string;
    youtube?: string;
  };
}

export async function getSiteSettings(): Promise<ResolvedSiteSettings> {
  try {
    const settings = await prisma.siteSetting.findMany();
    const settingsMap = new Map<string, string>();
    settings.forEach((s) => settingsMap.set(s.key, s.value));

    let adSlots = {
      headerBanner: true,
      inArticle: true,
      sidebar: true,
      endOfPost: true,
      stickyMobileFooter: true,
    };

    if (settingsMap.has("adSlotsConfig")) {
      try {
        adSlots = { ...adSlots, ...JSON.parse(settingsMap.get("adSlotsConfig") || "{}") };
      } catch {
        // fallback
      }
    }

    let social = { ...siteConfig.social };
    if (settingsMap.has("socialLinks")) {
      try {
        social = { ...social, ...JSON.parse(settingsMap.get("socialLinks") || "{}") };
      } catch {
        // fallback
      }
    }

    return {
      siteName: settingsMap.get("siteName") || siteConfig.name,
      tagline: settingsMap.get("tagline") || siteConfig.tagline,
      description: settingsMap.get("description") || siteConfig.description,
      logoUrl: settingsMap.get("logoUrl") || undefined,
      footerText: settingsMap.get("footerText") || `© ${new Date().getFullYear()} ${settingsMap.get("siteName") || siteConfig.name}. All rights reserved.`,
      contactEmail: settingsMap.get("contactEmail") || siteConfig.contact.email,
      contactAddress: settingsMap.get("contactAddress") || siteConfig.contact.address,
      contactPhone: settingsMap.get("contactPhone") || siteConfig.contact.phone,
      googleAnalyticsId: settingsMap.get("googleAnalyticsId") || process.env.NEXT_PUBLIC_GA_ID || "",
      adsensePublisherId: settingsMap.get("adsensePublisherId") || process.env.NEXT_PUBLIC_ADSENSE_ID || siteConfig.adsense.publisherId,
      adsTxtContent: settingsMap.get("adsTxtContent") || "google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0",
      adsEnabled: settingsMap.get("adsEnabled") === "false" ? false : true,
      adSlots,
      social,
    };
  } catch {
    // If DB is not yet migrated, fallback gracefully
    return {
      siteName: siteConfig.name,
      tagline: siteConfig.tagline,
      description: siteConfig.description,
      footerText: `© ${new Date().getFullYear()} ${siteConfig.name}. All rights reserved.`,
      contactEmail: siteConfig.contact.email,
      contactAddress: siteConfig.contact.address,
      contactPhone: siteConfig.contact.phone,
      googleAnalyticsId: process.env.NEXT_PUBLIC_GA_ID || "",
      adsensePublisherId: process.env.NEXT_PUBLIC_ADSENSE_ID || siteConfig.adsense.publisherId,
      adsTxtContent: "google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0",
      adsEnabled: true,
      adSlots: {
        headerBanner: true,
        inArticle: true,
        sidebar: true,
        endOfPost: true,
        stickyMobileFooter: true,
      },
      social: siteConfig.social,
    };
  }
}
