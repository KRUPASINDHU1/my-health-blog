import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AuthorManager } from "@/components/admin/AuthorManager";

export const dynamic = "force-dynamic";

export default async function AdminAuthorsPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const authors = await prisma.author.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { posts: true, reviewedPosts: true } },
    },
  });

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100">
      <AdminSidebar userRole={session.role} userName={session.name} />

      <main className="flex-1 p-6 sm:p-10 overflow-y-auto">
        <div className="mb-6 pb-6 border-b border-slate-800">
          <h1 className="text-2xl font-extrabold text-white">Authors &amp; Medical Reviewers</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your clinical editorial board, credentials, bios, and reviewer verifications.
          </p>
        </div>

        <AuthorManager initialAuthors={authors} />
      </main>
    </div>
  );
}
