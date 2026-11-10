import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ContactForm } from "@/components/ContactForm";
import { getSiteSettings } from "@/lib/settings";
import { Mail, MapPin, Phone, AlertCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: `Contact Our Editorial Team | ${settings.siteName}`,
    description: `Get in touch with the clinical and editorial board at ${settings.siteName} for research inquiries, corrections, or press questions.`,
  };
}

export default async function ContactPage() {
  const settings = await getSiteSettings();

  return (
    <>
      <Header siteName={settings.siteName} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 text-xs font-semibold mb-3">
            <Mail className="w-3.5 h-3.5" /> Direct Editorial Communications
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            Contact Our Editorial &amp; Clinical Team
          </h1>
          <p className="mt-3 text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            Have a question about a clinical citation, an editorial correction, or a health technology pitch? Reach out to our team below.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Contact Information & Office Details */}
          <div className="lg:col-span-5 space-y-8">
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Editorial Inquiries &amp; Offices
              </h3>

              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">Editorial Inquiries</p>
                    <a
                      href={`mailto:${settings.contactEmail}`}
                      className="text-teal-600 dark:text-teal-400 hover:underline text-xs sm:text-sm"
                    >
                      {settings.contactEmail}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">Main Office</p>
                    <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed">
                      {settings.contactAddress}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">Telephone</p>
                    <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">
                      {settings.contactPhone}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200 text-xs leading-relaxed space-y-1.5">
              <p className="font-bold flex items-center gap-1.5 text-amber-950 dark:text-amber-100">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                Medical Emergencies Notice:
              </p>
              <p>
                Our contact channels are monitored for journalistic and administrative inquiries only. We cannot respond to individual medical questions, diagnostic inquiries, or medical emergencies. If you are experiencing a medical emergency, please call your local emergency service (911/999/112) immediately.
              </p>
            </div>
          </div>

          {/* Interactive Contact Form */}
          <div className="lg:col-span-7">
            <div className="p-6 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Send Us a Message
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6">
                All messages are reviewed by our editorial desk within 24 to 48 business hours.
              </p>

              <ContactForm />
            </div>
          </div>
        </div>
      </main>

      <Footer siteName={settings.siteName} tagline={settings.tagline} />
    </>
  );
}
