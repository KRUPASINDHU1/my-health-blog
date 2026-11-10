import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getSiteSettings } from "@/lib/settings";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { SettingsManager } from "@/components/admin/SettingsManager";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  if (session.role !== "ADMIN") {
    return (
      <div className="flex min-h-screen bg-slate-900 text-slate-100">
        <AdminSidebar userRole={session.role} userName={session.name} />
        <main className="flex-1 p-10">
          <p className="text-rose-400">Access Restricted: Only Administrators can configure system settings.</p>
        </main>
      </div>
    );
  }

  const settings = await getSiteSettings();

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100">
      <AdminSidebar userRole={session.role} userName={session.name} />

      <main className="flex-1 p-6 sm:p-10 overflow-y-auto">
        <div className="mb-6 pb-6 border-b border-slate-800">
          <h1 className="text-2xl font-extrabold text-white">Site Settings &amp; AdSense Monetization</h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure site branding, Google AdSense monetization, dynamic ads.txt, and individual ad placements.
          </p>
        </div>

        <SettingsManager initialSettings={settings} />
      </main>
    </div>
  );
}
