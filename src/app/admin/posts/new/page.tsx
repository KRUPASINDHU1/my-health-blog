import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { PostEditor } from "@/components/admin/PostEditor";

export const dynamic = "force-dynamic";

export default async function NewPostPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const [categories, authors, tags] = await Promise.all([
    prisma.category.findMany({ orderBy: { order: "asc" } }),
    prisma.author.findMany({ orderBy: { name: "asc" } }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100">
      <AdminSidebar userRole={session.role} userName={session.name} />

      <main className="flex-1 p-6 sm:p-10 overflow-y-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-white">Create New Healthcare Article</h1>
          <p className="text-xs text-slate-400 mt-1">
            Publish an evidence-based clinical report, research summary, or medical technology piece.
          </p>
        </div>

        <PostEditor
          categories={categories}
          authors={authors}
          tags={tags}
        />
      </main>
    </div>
  );
}
