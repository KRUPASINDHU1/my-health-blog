import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { PagesManager } from "@/components/admin/PagesManager";

export const dynamic = "force-dynamic";

export default async function AdminPagesPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const pages = await prisma.page.findMany({
    orderBy: { title: "asc" },
  });

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100">
      <AdminSidebar userRole={session.role} userName={session.name} />

      <main className="flex-1 p-6 sm:p-10 overflow-y-auto">
        <div className="mb-6 pb-6 border-b border-slate-800">
          <h1 className="text-2xl font-extrabold text-white">Institutional &amp; Legal Pages Manager</h1>
          <p className="text-xs text-slate-400 mt-1">
            Edit content, legal statements, medical disclaimers, and editorial policies directly from the CMS.
          </p>
        </div>

        <PagesManager initialPages={pages} />
      </main>
    </div>
  );
}
