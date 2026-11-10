import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { SubscribersManager } from "@/components/admin/SubscribersManager";

export const dynamic = "force-dynamic";

export default async function AdminSubscribersPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const subscribers = await prisma.subscriber.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100">
      <AdminSidebar userRole={session.role} userName={session.name} />

      <main className="flex-1 p-6 sm:p-10 overflow-y-auto">
        <div className="mb-6 pb-6 border-b border-slate-800">
          <h1 className="text-2xl font-extrabold text-white">Newsletter Audience &amp; Subscribers</h1>
          <p className="text-xs text-slate-400 mt-1">
            View subscriber growth, source channels, and export CSV mailing lists.
          </p>
        </div>

        <SubscribersManager initialSubscribers={subscribers} />
      </main>
    </div>
  );
}
