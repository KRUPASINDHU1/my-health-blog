"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Inbox, Mail, CheckCircle2, Trash2, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface MessageItem {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  isSpam: boolean;
  createdAt: Date | string;
}

export function MessagesInbox({ initialMessages }: { initialMessages: MessageItem[] }) {
  const router = useRouter();
  const [messages, setMessages] = useState<MessageItem[]>(initialMessages);
  const [filterSpam, setFilterSpam] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const displayedMessages = messages.filter((m) => m.isSpam === filterSpam);

  const toggleReadStatus = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/contact/messages/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: !currentStatus }),
      });
      if (res.ok) {
        setMessages(
          messages.map((m) => (m.id === id ? { ...m, isRead: !currentStatus } : m))
        );
        router.refresh();
      }
    } catch {
      alert("Error updating message status.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Permanently delete this message?")) return;
    try {
      const res = await fetch(`/api/contact/messages/${id}`, { method: "DELETE" });
      if (res.ok) {
        setMessages(messages.filter((m) => m.id !== id));
        router.refresh();
      }
    } catch {
      alert("Error deleting message.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Filter Buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setFilterSpam(false)}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
            !filterSpam ? "bg-teal-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"
          }`}
        >
          Primary Inbox ({messages.filter((m) => !m.isSpam).length})
        </button>
        <button
          onClick={() => setFilterSpam(true)}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
            filterSpam ? "bg-teal-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"
          }`}
        >
          Spam / Honeypot Trapped ({messages.filter((m) => m.isSpam).length})
        </button>
      </div>

      {/* Messages List */}
      <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl overflow-hidden divide-y divide-slate-700/60">
        {displayedMessages.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Inbox className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No messages in this folder.</p>
          </div>
        ) : (
          displayedMessages.map((msg) => {
            const isExpanded = expandedId === msg.id;

            return (
              <div
                key={msg.id}
                className={`p-4 sm:p-5 transition ${
                  msg.isRead ? "bg-slate-800/30" : "bg-slate-800/80 border-l-4 border-teal-500"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-bold text-sm text-white truncate">{msg.name}</span>
                    <span className="text-xs text-slate-400 truncate">({msg.email})</span>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto text-xs text-slate-400">
                    <span>{formatDate(msg.createdAt)}</span>
                    <button
                      onClick={() => toggleReadStatus(msg.id, msg.isRead)}
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                        msg.isRead
                          ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                          : "bg-teal-900 text-teal-300 hover:bg-teal-800"
                      }`}
                    >
                      {msg.isRead ? "Mark Unread" : "Mark Read"}
                    </button>
                    <button
                      onClick={() => handleDelete(msg.id)}
                      className="p-1 text-rose-400 hover:text-rose-300"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : msg.id)}
                      className="p-1 text-slate-400 hover:text-white"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="mt-2">
                  <p className="text-xs sm:text-sm font-semibold text-teal-300">
                    Subject: {msg.subject}
                  </p>
                  <p
                    className={`mt-1 text-xs text-slate-300 leading-relaxed ${
                      isExpanded ? "whitespace-pre-wrap" : "line-clamp-2"
                    }`}
                  >
                    {msg.message}
                  </p>
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center gap-3">
                    <a
                      href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject)}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs"
                    >
                      <Mail className="w-3.5 h-3.5" /> Reply via Email Client
                    </a>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
