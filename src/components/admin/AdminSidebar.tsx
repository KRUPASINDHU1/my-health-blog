"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  FolderTree,
  Users,
  Image,
  Inbox,
  Mail,
  Files,
  Settings,
  ExternalLink,
  LogOut,
  Activity,
  Shield,
} from "lucide-react";

interface AdminSidebarProps {
  userRole?: string;
  userName?: string;
}

export function AdminSidebar({ userRole = "ADMIN", userName = "Admin" }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch {
      router.push("/admin/login");
    }
  };

  const navItems = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "All Posts", href: "/admin/posts", icon: FileText },
    { label: "New Post", href: "/admin/posts/new", icon: PlusCircle },
    { label: "Categories & Tags", href: "/admin/categories", icon: FolderTree },
    { label: "Authors & Reviewers", href: "/admin/authors", icon: Users },
    { label: "Media Library", href: "/admin/media", icon: Image },
    { label: "Contact Inbox", href: "/admin/messages", icon: Inbox },
    { label: "Subscribers", href: "/admin/subscribers", icon: Mail },
    { label: "Pages Manager", href: "/admin/pages", icon: Files },
    { label: "Site & AdSense Settings", href: "/admin/settings", icon: Settings, adminOnly: true },
  ];

  const isLinkActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 min-h-screen border-r border-slate-800">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
            <Activity className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-white block">
              HealthCMS
            </span>
            <span className="text-[10px] text-teal-400 font-bold uppercase tracking-wider block">
              Admin Portal
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          if (item.adminOnly && userRole !== "ADMIN") return null;
          const active = isLinkActive(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                active
                  ? "bg-teal-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/80"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Info & Footer Actions */}
      <div className="p-3 border-t border-slate-800 space-y-2">
        <div className="px-3 py-2 rounded-xl bg-slate-800/50 flex items-center justify-between">
          <div className="truncate pr-2">
            <p className="text-xs font-bold text-white truncate">{userName}</p>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-teal-900/60 text-teal-300 font-semibold uppercase">
              {userRole}
            </span>
          </div>
          <Shield className="w-4 h-4 text-teal-400 shrink-0" />
        </div>

        <div className="flex items-center gap-2 pt-1">
          <Link
            href="/"
            target="_blank"
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            View Site
          </Link>
          <button
            onClick={handleLogout}
            className="p-2 rounded-xl bg-slate-800 text-rose-400 hover:bg-rose-950/60 hover:text-rose-300 transition"
            title="Logout"
            aria-label="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
