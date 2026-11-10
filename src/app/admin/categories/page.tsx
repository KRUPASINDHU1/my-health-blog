import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { CategoryTagManager } from "@/components/admin/CategoryTagManager";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const [categories, tags] = await Promise.all([
    prisma.category.findMany({
      orderBy: { order: "asc" },
      include: { _count: { select: { posts: true } } },
    }),
    prisma.tag.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { posts: true } } },
    }),
  ]);

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100">
      <AdminSidebar userRole={session.role} userName={session.name} />

      <main className="flex-1 p-6 sm:p-10 overflow-y-auto">
        <div className="mb-6 pb-6 border-b border-slate-800">
          <h1 className="text-2xl font-extrabold text-white">Categories &amp; Tags Taxonomy</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage medical taxonomy, clinical classifications, color badges, and search tags.
          </p>
        </div>

        <CategoryTagManager initialCategories={categories} initialTags={tags} />
      </main>
    </div>
  );
}
