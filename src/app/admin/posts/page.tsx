import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { formatDate } from "@/lib/utils";
import { PlusCircle, Search, Eye, Edit, Trash2, ExternalLink } from "lucide-react";
import { DeletePostButton } from "@/components/admin/DeletePostButton";

export const dynamic = "force-dynamic";

interface AdminPostsPageProps {
  searchParams: Promise<{
    q?: string;
    status?: string;
  }>;
}

export default async function AdminPostsPage({ searchParams }: AdminPostsPageProps) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const { q, status } = await searchParams;

  const where: any = {};
  if (status && status !== "ALL") {
    where.status = status;
  }
  if (q) {
    where.OR = [
      { title: { contains: q } },
      { excerpt: { contains: q } },
    ];
  }

  const posts = await prisma.post.findMany({
    where,
    include: {
      author: true,
      reviewedBy: true,
      categories: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100">
      <AdminSidebar userRole={session.role} userName={session.name} />

      <main className="flex-1 p-6 sm:p-10 overflow-y-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Clinical Articles &amp; Posts
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Create, review, edit, and schedule peer-reviewed healthcare publications.
            </p>
          </div>

          <Link
            href="/admin/posts/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition"
          >
            <PlusCircle className="w-4 h-4" /> New Article
          </Link>
        </div>

        {/* Search & Filter Bar */}
        <div className="my-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <form method="GET" action="/admin/posts" className="relative w-full sm:w-80">
            <input
              type="search"
              name="q"
              defaultValue={q || ""}
              placeholder="Search posts..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            {status && <input type="hidden" name="status" value={status} />}
          </form>

          <div className="flex items-center gap-2 self-start sm:self-auto overflow-x-auto w-full sm:w-auto">
            {["ALL", "PUBLISHED", "DRAFT", "SCHEDULED"].map((s) => (
              <Link
                key={s}
                href={`/admin/posts?status=${s}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition ${
                  (status || "ALL") === s
                    ? "bg-teal-600 text-white"
                    : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                {s}
              </Link>
            ))}
          </div>
        </div>

        {/* Posts Table */}
        <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-700">
                <tr>
                  <th className="py-3 px-4">Title &amp; Categories</th>
                  <th className="py-3 px-4">Author &amp; Reviewer</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Views</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {posts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No posts found.
                    </td>
                  </tr>
                ) : (
                  posts.map((post) => (
                    <tr key={post.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4 max-w-xs">
                        <Link
                          href={`/admin/posts/${post.id}/edit`}
                          className="font-bold text-white hover:text-teal-400 block truncate"
                        >
                          {post.title}
                        </Link>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {post.categories.map((c) => (
                            <span
                              key={c.id}
                              className="text-[10px] px-2 py-0.2 rounded-full font-semibold text-white"
                              style={{ backgroundColor: c.color }}
                            >
                              {c.name}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-300">
                        <span className="font-semibold block">{post.author.name}</span>
                        {post.reviewedBy && (
                          <span className="text-[10px] text-teal-400 block">
                            Rev: {post.reviewedBy.name}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                            post.status === "PUBLISHED"
                              ? "bg-teal-950 text-teal-300 border border-teal-800"
                              : post.status === "DRAFT"
                              ? "bg-amber-950 text-amber-300 border border-amber-800"
                              : "bg-cyan-950 text-cyan-300 border border-cyan-800"
                          }`}
                        >
                          {post.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-300">
                        {post.viewsCount.toLocaleString()}
                      </td>

                      <td className="py-3.5 px-4 text-slate-400">
                        {formatDate(post.publishedAt || post.createdAt)}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {post.status === "PUBLISHED" && (
                            <Link
                              href={`/blog/${post.slug}`}
                              target="_blank"
                              className="p-1.5 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white"
                              title="View Public Article"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          )}
                          <Link
                            href={`/admin/posts/${post.id}/edit`}
                            className="p-1.5 rounded-lg bg-teal-900/40 hover:bg-teal-900 text-teal-300"
                            title="Edit Article"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Link>
                          <DeletePostButton postId={post.id} postTitle={post.title} />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
