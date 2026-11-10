import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { formatDate } from "@/lib/utils";
import {
  FileText,
  Eye,
  Users,
  Inbox,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await getSession();
  if (!session) {
    redirect("/admin/login");
  }

  // Fetch metrics in parallel
  const [
    totalPosts,
    publishedPosts,
    draftPosts,
    scheduledPosts,
    totalSubscribers,
    unreadMessages,
    viewsSum,
    recentPosts,
    recentMessages,
  ] = await Promise.all([
    prisma.post.count(),
    prisma.post.count({ where: { status: "PUBLISHED" } }),
    prisma.post.count({ where: { status: "DRAFT" } }),
    prisma.post.count({ where: { status: "SCHEDULED" } }),
    prisma.subscriber.count({ where: { status: "ACTIVE" } }),
    prisma.contactMessage.count({ where: { isRead: false, isSpam: false } }),
    prisma.post.aggregate({ _sum: { viewsCount: true } }),
    prisma.post.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { author: true, categories: true },
    }),
    prisma.contactMessage.findMany({
      where: { isSpam: false },
      take: 5,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const totalViews = viewsSum._sum.viewsCount || 0;

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100">
      <AdminSidebar userRole={session.role} userName={session.name} />

      <main className="flex-1 p-6 sm:p-10 overflow-y-auto">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-slate-800">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Clinical Publication Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Welcome back, {session.name} ({session.role}). Here is the real-time operational status of your publication.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/posts/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition"
            >
              <PlusCircle className="w-4 h-4" /> Create New Post
            </Link>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 my-8">
          {/* Published Articles */}
          <div className="p-5 rounded-2xl bg-slate-800/70 border border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Published Posts
              </span>
              <div className="p-2 rounded-xl bg-teal-950 text-teal-400">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <p className="text-3xl font-extrabold text-white">{publishedPosts}</p>
              <span className="text-xs text-slate-400">of {totalPosts} total</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1 border-t border-slate-700/60">
              <span className="text-amber-400">{draftPosts} Drafts</span> •{" "}
              <span className="text-cyan-400">{scheduledPosts} Scheduled</span>
            </div>
          </div>

          {/* Total Views */}
          <div className="p-5 rounded-2xl bg-slate-800/70 border border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total Article Views
              </span>
              <div className="p-2 rounded-xl bg-blue-950 text-blue-400">
                <Eye className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-white">{totalViews.toLocaleString()}</p>
            <div className="flex items-center gap-1 text-[11px] text-teal-400 pt-1 border-t border-slate-700/60">
              <TrendingUp className="w-3.5 h-3.5" /> High organic readership
            </div>
          </div>

          {/* Subscribers */}
          <div className="p-5 rounded-2xl bg-slate-800/70 border border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Subscribers
              </span>
              <div className="p-2 rounded-xl bg-purple-950 text-purple-400">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-white">{totalSubscribers.toLocaleString()}</p>
            <div className="pt-1 border-t border-slate-700/60">
              <Link href="/admin/subscribers" className="text-[11px] text-teal-400 hover:underline">
                View &amp; Export CSV →
              </Link>
            </div>
          </div>

          {/* Inbox / Messages */}
          <div className="p-5 rounded-2xl bg-slate-800/70 border border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Unread Inquiries
              </span>
              <div className="p-2 rounded-xl bg-rose-950 text-rose-400">
                <Inbox className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-white">{unreadMessages}</p>
            <div className="pt-1 border-t border-slate-700/60">
              <Link href="/admin/messages" className="text-[11px] text-teal-400 hover:underline">
                Open Contact Inbox →
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Content & Messages Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-8">
          {/* Recent Articles (Col 7) */}
          <div className="lg:col-span-7 bg-slate-800/50 border border-slate-700/80 rounded-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-700">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-400" />
                Recent Articles
              </h3>
              <Link
                href="/admin/posts"
                className="text-xs font-semibold text-teal-400 hover:underline flex items-center gap-1"
              >
                All Posts ({totalPosts}) <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-700/60 mt-3">
              {recentPosts.map((post) => (
                <div key={post.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white truncate hover:text-teal-400">
                      <Link href={`/admin/posts/${post.id}/edit`}>{post.title}</Link>
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      By {post.author.name} • {formatDate(post.publishedAt || post.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
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
                    <Link
                      href={`/admin/posts/${post.id}/edit`}
                      className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-700/60"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Messages (Col 5) */}
          <div className="lg:col-span-5 bg-slate-800/50 border border-slate-700/80 rounded-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-700">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Inbox className="w-4 h-4 text-teal-400" />
                Recent Inquiries
              </h3>
              <Link
                href="/admin/messages"
                className="text-xs font-semibold text-teal-400 hover:underline flex items-center gap-1"
              >
                Inbox <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-700/60 mt-3">
              {recentMessages.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No messages yet.</p>
              ) : (
                recentMessages.map((msg) => (
                  <div key={msg.id} className="py-3 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white truncate max-w-[150px]">{msg.name}</span>
                      <span className="text-slate-400 text-[10px]">{formatDate(msg.createdAt)}</span>
                    </div>
                    <p className="text-xs text-teal-300 font-medium truncate">{msg.subject}</p>
                    <p className="text-[11px] text-slate-400 line-clamp-1">{msg.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
