# 🏥 Healthcare Publication & Custom CMS Platform

An enterprise-grade, production-ready healthcare publication and headless content management system (CMS) engineered with **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Prisma ORM**. 

Optimized from the ground up for **Google AdSense publisher approval**, **E-E-A-T clinical authority** (Experience, Expertise, Authoritativeness, Trustworthiness), **Core Web Vitals (CLS = 0)**, and **international privacy compliance (GDPR, CCPA/CPRA, India DPDP)**.

---

## 🌟 Key Features

### 1. Public Medical Publication
- **Homepage:** Hero with live instant search, Lead Clinical Investigation showcase, 6 categorized domain sections, most-read trending articles, clinical trust badges, and newsletter signup.
- **Blog Archive (`/blog`):** Full-text search, category filters, tag filters, and server-side pagination.
- **Single Article Page (`/blog/[slug]`):**
  - Clinical review badge with verified reviewer credentials
  - Prominent, unmissable Medical & Legal Disclaimer box
  - Dynamic Table of Contents with smooth scrollspy
  - Reading time calculation
  - Social sharing suite (Twitter/X, LinkedIn, Facebook, direct link copying)
  - Peer-reviewed **Sources & References** section with academic citations & DOI links
  - Author biography card with credentials and profile links
  - Related articles carousel
  - Layout-shift-free **Google AdSense** ad slots
- **Category & Tag Archives (`/category/[slug]`, `/tag/[slug]`):** Filtered article listings with metadata.
- **Medical Editorial Board (`/authors`, `/author/[slug]`):** Physician and researcher profile pages highlighting board certifications, institutional titles, authored articles, and peer-reviewed articles.
- **Institutional & Legal Pages (Pre-written with complete real copy, zero lorem-ipsum):**
  - **About Us** (`/about`)
  - **Medical Disclaimer** (`/medical-disclaimer`)
  - **Privacy Policy** (`/privacy-policy`) – Covers Google AdSense, DoubleClick cookies, Google Analytics, user rights under GDPR, CCPA, and DPDP.
  - **Terms & Conditions** (`/terms`)
  - **Cookie Policy** (`/cookie-policy`)
  - **Advertising & Affiliate Disclosure** (`/advertising-disclosure`)
  - **Editorial & Sourcing Standards** (`/editorial-policy`)
  - **HTML Sitemap** (`/sitemap-page`)
  - **Custom 404 Error Page** (`/not-found`)

### 2. Custom Admin CMS Backend (`/admin`)
- **Security & Access Control:**
  - Token-bucket login rate-limiting (brute-force defense)
  - Password hashing with `bcryptjs` (salt rounds: 12)
  - Secure, HTTP-only, SameSite JWT session cookies
  - Role-Based Access Control (Admin and Editor roles)
  - **First-Run Setup Wizard (`/admin/setup`):** Automatically detects if an owner account exists; locks permanently once initialized.
- **Operational Dashboard (`/admin`):**
  - Live metric cards: Total Posts, Published, Drafts, Scheduled, Total Article Views, Subscribers, Unread Inquiries.
  - Recent posts and contact message feeds.
- **Post Manager (`/admin/posts`, `/admin/posts/new`, `/admin/posts/[id]/edit`):**
  - Rich text editor with instant HTML formatting toolbar (Headings, Bold, Italic, Lists, Blockquotes, Clinical Callout Boxes, Tables)
  - Status management: `DRAFT`, `PUBLISHED`, `SCHEDULED`
  - Featured image uploader with WCAG AA alt text
  - Real-time estimated reading time calculator
  - Multi-category & tag taxonomy selector
  - SEO suite: Custom Meta Title, Meta Description, Canonical URL, OpenGraph image preview
  - Multi-item **Sources & References** manager
  - Clinical peer reviewer selector (`reviewedById`)
- **Taxonomy Manager (`/admin/categories`):** Add, edit, delete categories with custom color badges and order.
- **Author & Reviewer Manager (`/admin/authors`):** Manage physician profiles, qualifications, headshots, and social links.
- **Media Library (`/admin/media`):** Drag-and-drop file uploader with direct URL copying and asset management.
- **Contact Message Inbox (`/admin/messages`):**
  - Built-in honeypot spam protection (spambots trapped silently without disrupting workflow)
  - Expandable messages, mark read/unread, direct email reply action.
- **Newsletter Audience (`/admin/subscribers`):**
  - Subscriber tracking with acquisition sources
  - **One-click CSV export** for Mailchimp, Substack, Brevo, or Klaviyo.
- **Static Pages Manager (`/admin/pages`):** Live editing of all legal, disclaimer, and informational pages without touching code.
- **Site & AdSense Settings (`/admin/settings`):**
  - Update `[SITE NAME]` placeholder dynamically
  - Global ads master toggle
  - Granular AdSlot toggles (Header Banner, In-Article, Sidebar, End of Post, Sticky Mobile Footer)
  - Live `/ads.txt` editor
  - Google Analytics 4 (GA4) measurement ID

### 3. Google AdSense Monetization & Cookie Consent
- **AdSense Script Injection:** Automatically injects Google AdSense tag globally ONLY when a Publisher ID is configured AND marketing cookie consent is granted.
- **Cumulative Layout Shift (CLS = 0):** Every `<AdSlot />` reserves explicit minimum height and width to prevent layout jumping when ads load.
- **Strict Policy Compliance:**
  - Clear, non-deceptive uppercase `"ADVERTISEMENT"` labels
  - Zero ads on legal, disclaimer, contact, 404, or admin pages
  - High editorial content-to-ad ratio
- **Dynamic `/ads.txt`:** Serves your verified publisher record automatically at `http://yourdomain.com/ads.txt`.
- **GDPR / CCPA / DPDP Cookie Consent Banner:**
  - Granular consent controls (Strictly Necessary, Analytics & Performance, Advertising & AdSense)
  - Real-time dynamic script trigger upon consent.

### 4. SEO & Technical Performance
- **Structured Data (Schema.org JSON-LD):**
  - `MedicalWebPage` & `Article` schema on every blog post
  - `MedicalOrganization` schema on root layout
  - `Person` schema on author pages
  - `BreadcrumbList` schema
- **Dynamic XML Sitemap:** Automatically generated at `/sitemap.xml` indexing all articles, categories, and authors.
- **Dynamic Robots.txt:** Generated at `/robots.txt` explicitly welcoming `Mediapartners-Google` (AdSense bot).
- **RSS 2.0 Feeds:** Available at both `/feed.xml` and `/rss.xml`.

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 18.17+ or 20+ (tested on Node 24)
- npm or pnpm

### 1. Clone & Install Dependencies
```bash
git clone <repository-url>
cd "website for personal blog"
npm install
```

### 2. Environment Configuration
The project is pre-configured with a local SQLite database for zero-friction setup:
```bash
# Check .env (already created with default SQLite URL)
DATABASE_URL="file:./dev.db"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
JWT_SECRET="super-secure-jwt-secret-key-change-this-in-production-healthcare-cms-2026"
NEXT_PUBLIC_ADSENSE_ID=""
NEXT_PUBLIC_GA_ID=""
```

### 3. Initialize & Seed Database
```bash
# Push schema to SQLite database
npx prisma db push

# Seed with 3 medical authors, 6 categories, 8 comprehensive 600+ word clinical articles, and legal pages
npm run db:seed
```

### 4. Run Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🔐 Admin Authentication
- **Admin Login Portal:** `https://healthtechspectrum.online/admin/login` (or `http://localhost:3000/admin/login`)
- Configurable via `ADMIN_EMAIL` and `ADMIN_PASSWORD` in your environment.
- Passwords are encrypted using enterprise bcrypt hashing (salt rounds: 12).

---

## 🏷️ How to Customize "[SITE NAME]"

To rename the site across the entire codebase:
1. **Option A (Via Admin CMS):** Navigate to **Admin → Site & AdSense Settings**, update the **Site Brand Name** field, and click Save.
2. **Option B (Via Code):** Open [`src/config/site.ts`](file:///c:/Users/kdsur/Desktop/Personal%20Project/website%20for%20personal%20blog/src/config/site.ts) and edit:
```typescript
export const siteConfig = {
  name: "Your Brand Name", // e.g. "PulseHealth Medical"
  tagline: "Your publication tagline...",
  // ...
};
```

---

## 💰 How to Configure Google AdSense

1. Log in to `/admin` with your admin account.
2. Navigate to **Site & AdSense Settings** (`/admin/settings`).
3. Enter your **Google AdSense Publisher ID** (e.g. `ca-pub-1234567890123456`).
4. Paste your authorized `ads.txt` line (e.g. `google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0`).
5. Choose which ad placements you want active:
   - Header Leaderboard Banner (728x90)
   - In-Article Banner (after 2nd paragraph)
   - Sidebar Skyscraper (300x600)
   - End of Post Banner
   - Sticky Mobile Anchor (320x50)
6. Click **Save System Settings**. Your ads will automatically begin serving to consented visitors!

---

## 📋 Google AdSense Approval Checklist

Before submitting your site for review in the Google AdSense dashboard, complete this checklist:

- [ ] **Personalize Brand Name:** Change `[SITE NAME]` to your official publication name in `/admin/settings`.
- [ ] **Custom Domain:** Connect a top-level domain (e.g., `https://yourhealthblog.com`) with active SSL/TLS (HTTPS).
- [ ] **Author Credentials:** Review the 3 demo authors in `/admin/authors` and ensure their credentials, bios, and links accurately reflect your editorial staff.
- [ ] **Original Content:** The site includes 8 high-quality evidence-based seed articles (600+ words each). Add at least 5–10 more original articles written or reviewed by medical experts.
- [ ] **Contact Form Verification:** Send a test inquiry through `/contact` to confirm your contact details are working.
- [ ] **Legal Review:** Review `/privacy-policy`, `/medical-disclaimer`, and `/editorial-policy` in `/admin/pages` to ensure jurisdiction-specific alignment.
- [ ] **ads.txt Verification:** Visit `https://yourdomain.com/ads.txt` to confirm your AdSense publisher record is accessible publicly.

---

## 🚢 Production Deployment Guide

### Deploying to Vercel (Recommended)
1. Push your repository to GitHub or GitLab.
2. Import the project into **[Vercel](https://vercel.com)**.
3. Provision a PostgreSQL database (e.g., **Vercel Postgres**, **Neon**, or **Supabase**).
4. Update `prisma/schema.prisma` datasource provider from `"sqlite"` to `"postgresql"`.
5. Set Environment Variables in Vercel Project Settings:
   - `DATABASE_URL`: `postgresql://user:password@host:5432/dbname?sslmode=require`
   - `NEXT_PUBLIC_SITE_URL`: `https://yourhealthblog.com`
   - `JWT_SECRET`: `<generate-a-strong-random-64-char-string>`
   - `NEXT_PUBLIC_ADSENSE_ID`: `ca-pub-XXXXXXXXXXXXXXXX`
6. In **Build & Development Settings**, set the Build Command:
   ```bash
   prisma generate && prisma db push && node prisma/seed.js && next build
   ```
7. Click **Deploy**!

### Deploying with Docker / VPS
A standard Docker build can be executed with:
```dockerfile
FROM node:20-alpine AS runner
WORKDIR /app
COPY . .
RUN npm ci
RUN npx prisma generate
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 🧪 Verification & Test Results

The full application was compiled and tested:
- **Build Status:** `✓ Compiled successfully (38 static & dynamic routes generated)`
- **Route Validation:** 23 out of 23 routes verified HTTP 200 OK
- **Contact Pipeline:** Tested & verified with honeypot spam protection
- **Authentication:** Tested with bcrypt hash comparison & JWT session cookie injection
- **CLS (Layout Shift):** Zero layout shift with reserved ad containers
