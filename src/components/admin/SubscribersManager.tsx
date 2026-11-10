"use client";

import { useState } from "react";
import { Download, Mail, Trash2, Users } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface SubscriberItem {
  id: string;
  email: string;
  status: string;
  source: string;
  createdAt: Date | string;
}

export function SubscribersManager({ initialSubscribers }: { initialSubscribers: SubscriberItem[] }) {
  const [subscribers, setSubscribers] = useState<SubscriberItem[]>(initialSubscribers);

  const handleDelete = async (id: string, email: string) => {
    if (!confirm(`Remove ${email} from subscriber list?`)) return;
    try {
      const res = await fetch("/api/newsletter/subscribers", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setSubscribers(subscribers.filter((s) => s.id !== id));
      }
    } catch {
      alert("Failed to delete subscriber.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-teal-400" />
          Active Mailing List ({subscribers.length})
        </h2>

        <a
          href="/api/newsletter/export"
          download
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow transition cursor-pointer"
        >
          <Download className="w-4 h-4" />
          Export Subscribers CSV
        </a>
      </div>

      <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-700">
              <tr>
                <th className="py-3 px-4">Subscriber Email</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Acquisition Source</th>
                <th className="py-3 px-4">Subscribed At</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {subscribers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No subscribers found.
                  </td>
                </tr>
              ) : (
                subscribers.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-teal-400" />
                      {s.email}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800 uppercase">
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">{s.source}</td>
                    <td className="py-3.5 px-4 text-slate-400">{formatDate(s.createdAt)}</td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDelete(s.id, s.email)}
                        className="p-1 text-rose-400 hover:text-rose-300"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
