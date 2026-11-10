import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { CookieConsent } from "@/components/CookieConsent";
import { AdSenseScript } from "@/components/AdSenseScript";
import { AdSlot } from "@/components/AdSlot";
import { getSiteSettings } from "@/lib/settings";
import { getBaseUrl } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();

  return {
    metadataBase: new URL(getBaseUrl()),
    title: {
      default: `${settings.siteName} | ${settings.tagline}`,
      template: `%s | ${settings.siteName}`,
    },
    description: settings.description,
    keywords: [
      "healthcare innovations",
      "medical technology",
      "clinical therapeutics",
      "precision oncology",
      "evidence-based medicine",
      "digital health",
      "clinical research",
      "nutrition science",
      "sleep biology",
    ],
    authors: [{ name: `${settings.siteName} Editorial Board` }],
    creator: settings.siteName,
    publisher: settings.siteName,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
      siteName: settings.siteName,
      title: `${settings.siteName} | ${settings.tagline}`,
      description: settings.description,
    },
    twitter: {
      card: "summary_large_image",
      title: `${settings.siteName} | ${settings.tagline}`,
      description: settings.description,
      creator: "@sitename",
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "MedicalOrganization",
    name: settings.siteName,
    url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    description: settings.description,
    publishingPrinciples: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/editorial-policy`,
    knowsAbout: [
      "Clinical Medicine",
      "Medical Artificial Intelligence",
      "Pharmacotherapy",
      "Cardiovascular Prevention",
      "Preventative Health",
    ],
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        {settings.googleAnalyticsId && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${settings.googleAnalyticsId}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${settings.googleAnalyticsId}');
                `,
              }}
            />
          </>
        )}
      </head>
      <body className="min-h-screen flex flex-col font-sans">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AdSenseScript
            publisherId={settings.adsensePublisherId}
            enabled={settings.adsEnabled}
          />
          {children}
          {/* Sticky Mobile Ad Slot if enabled */}
          {settings.adsEnabled && settings.adSlots.stickyMobileFooter && (
            <AdSlot
              placement="stickyMobileFooter"
              publisherId={settings.adsensePublisherId}
              adsEnabled={settings.adsEnabled}
            />
          )}
          <CookieConsent />
        </ThemeProvider>
      </body>
    </html>
  );
}
