/**
 * Central Site Configuration
 * 
 * Replace '[SITE NAME]' below to rename your healthcare publication across the entire platform.
 * You can also update this dynamically in the Admin Settings (/admin/settings).
 */

export const siteConfig = {
  // Replace this placeholder with your brand name, e.g., "PulseHealth Medical", "Aegis Health Journal"
  name: "[SITE NAME]",
  shortName: "HealthPulse",
  tagline: "Evidence-Based Medical Innovations, Clinical Insights & Wellness Science",
  description: "A premier peer-reviewed health publication delivering evidence-backed articles on healthcare technology, medical breakthroughs, clinical therapeutics, nutrition, and public health.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ogImage: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80",
  
  contact: {
    email: "editorial@sitename.com",
    pressEmail: "press@sitename.com",
    address: "742 Evergreen Terrace, Suite 400, Boston, MA 02115",
    phone: "+1 (800) 555-0199",
  },

  social: {
    twitter: "https://twitter.com/sitename",
    linkedin: "https://linkedin.com/company/sitename",
    facebook: "https://facebook.com/sitename",
    youtube: "https://youtube.com/sitename",
    github: "https://github.com",
  },

  editorial: {
    reviewProcess: "All medical articles are strictly reviewed by certified physicians or subject matter experts before publication.",
    disclaimerVersion: "2026.1",
  },

  adsense: {
    // Leave blank until approved, e.g., "ca-pub-1234567890123456"
    publisherId: process.env.NEXT_PUBLIC_ADSENSE_ID || "",
    // Dynamic slots config
    slots: {
      headerBanner: process.env.ADSENSE_SLOT_HEADER || "header-banner-slot",
      inArticle: process.env.ADSENSE_SLOT_IN_ARTICLE || "in-article-slot",
      sidebar: process.env.ADSENSE_SLOT_SIDEBAR || "sidebar-slot",
      endOfPost: process.env.ADSENSE_SLOT_END_POST || "end-of-post-slot",
      stickyMobileFooter: process.env.ADSENSE_SLOT_MOBILE_FOOTER || "sticky-footer-slot",
    },
  },

  nav: [
    { label: "Home", href: "/" },
    { label: "Articles", href: "/blog" },
    { label: "Categories", href: "/categories" },
    { label: "About Us", href: "/about" },
    { label: "Editorial Policy", href: "/editorial-policy" },
    { label: "Contact", href: "/contact" },
  ],

  legalNav: [
    { label: "Medical Disclaimer", href: "/medical-disclaimer" },
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms & Conditions", href: "/terms" },
    { label: "Cookie Policy", href: "/cookie-policy" },
    { label: "Advertising Disclosure", href: "/advertising-disclosure" },
    { label: "Editorial Standards", href: "/editorial-policy" },
    { label: "Sitemap", href: "/sitemap-page" },
  ],
};
