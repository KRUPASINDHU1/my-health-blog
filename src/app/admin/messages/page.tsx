import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { MessagesInbox } from "@/components/admin/MessagesInbox";

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100">
      <AdminSidebar userRole={session.role} userName={session.name} />

      <main className="flex-1 p-6 sm:p-10 overflow-y-auto">
        <div className="mb-6 pb-6 border-b border-slate-800">
          <h1 className="text-2xl font-extrabold text-white">Contact &amp; Editorial Messages</h1>
          <p className="text-xs text-slate-400 mt-1">
            Review incoming clinical questions, editorial corrections, press inquiries, and spam filtering.
          </p>
        </div>

        <MessagesInbox initialMessages={messages} />
      </main>
    </div>
  );
}
