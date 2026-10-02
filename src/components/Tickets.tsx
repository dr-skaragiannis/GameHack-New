import { useState } from "react";
import * as db from "../lib/db";
import { CAMPAIGNS } from "../data/lessons";
import type { Lang } from "../i18n";
import { timeAgo } from "./PlayerDashboard";
import { cn } from "../utils/cn";

export default function Tickets({ user, lang }: { user: db.User; lang: Lang }) {
  const [, force] = useState(0);
  const refresh = () => force((x) => x + 1);
  const tickets = db.ticketsFor(user);
  const [openId, setOpenId] = useState<string | null>(tickets[0]?.id || null);
  const [creating, setCreating] = useState(false);
  const [reply, setReply] = useState("");

  // new ticket form
  const [subject, setSubject] = useState("");
  const [moduleId, setModuleId] = useState<string>("");
  const [priority, setPriority] = useState<db.Ticket["priority"]>("normal");
  const [body, setBody] = useState("");

  const allModules = CAMPAIGNS.flatMap((c) => c.modules.map((m) => ({ id: m.id, title: m.title[lang] })));
  const open = tickets.find((t) => t.id === openId) || null;

  const submitNew = () => {
    if (!subject.trim() || !body.trim()) return;
    const tk = db.createTicket(user, subject.trim(), moduleId || null, body.trim(), priority);
    setCreating(false);
    setSubject("");
    setBody("");
    setModuleId("");
    setOpenId(tk.id);
    refresh();
  };

  const sendReply = () => {
    if (!reply.trim() || !open) return;
    db.replyTicket(open.id, user, reply.trim());
    setReply("");
    refresh();
  };

  return (
    <div className="w-full">
      <div className="enter enter-1 mb-5 flex items-center justify-between">
        <div>
          <div className="font-mono text-xs uppercase tracking-[0.35em] text-ember-500">Support</div>
          <h2 className="text-3xl font-black text-shine">{user.role === "educator" ? "Player Tickets" : "My Tickets"}</h2>
        </div>
        {user.role === "player" && (
          <button
            onClick={() => setCreating(true)}
            className="rounded-lg bg-ember-600 px-4 py-2 font-mono text-xs font-bold text-white hover:bg-ember-500"
          >
            + New ticket
          </button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_1.4fr]">
        {/* list */}
        <div className="space-y-2">
          {tickets.length === 0 && (
            <div className="rounded-xl border border-forge-border bg-forge-panel p-6 text-center text-sm text-iron-500">
              No tickets yet.
            </div>
          )}
          {tickets.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setOpenId(t.id);
                setCreating(false);
              }}
              className={cn(
                "w-full rounded-xl border p-3 text-left transition",
                openId === t.id && !creating ? "border-ember-500/60 bg-ember-500/5" : "border-forge-border bg-forge-panel hover:border-ember-500/40"
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-sm font-bold text-zinc-100">{t.subject}</span>
                <StatusPill status={t.status} />
              </div>
              <div className="mt-1 flex items-center gap-2 font-mono text-[10px] text-iron-500">
                {user.role === "educator" && <span className="text-ember-400">{t.playerName}</span>}
                <span className={cn("rounded px-1", priColor(t.priority))}>{t.priority}</span>
                <span>{timeAgo(t.createdAt)}</span>
              </div>
            </button>
          ))}
        </div>

        {/* detail / create */}
        <div className="rounded-xl border border-forge-border bg-forge-panel p-5">
          {creating ? (
            <div className="space-y-3">
              <h3 className="font-mono text-sm font-bold text-ember-400">New ticket</h3>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Subject"
                className="w-full rounded-lg border border-forge-border bg-forge-bg px-3 py-2 text-sm text-zinc-100 outline-none focus:border-ember-500"
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={moduleId}
                  onChange={(e) => setModuleId(e.target.value)}
                  className="rounded-lg border border-forge-border bg-forge-bg px-3 py-2 text-sm text-zinc-100 outline-none focus:border-ember-500"
                >
                  <option value="">General (no lab)</option>
                  {allModules.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title}
                    </option>
                  ))}
                </select>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as db.Ticket["priority"])}
                  className="rounded-lg border border-forge-border bg-forge-bg px-3 py-2 text-sm text-zinc-100 outline-none focus:border-ember-500"
                >
                  <option value="low">Low priority</option>
                  <option value="normal">Normal priority</option>
                  <option value="high">High priority</option>
                </select>
              </div>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={5}
                placeholder="Describe your question or the issue with the lab…"
                className="w-full resize-none rounded-lg border border-forge-border bg-forge-bg px-3 py-2 text-sm text-zinc-100 outline-none focus:border-ember-500"
              />
              <div className="flex gap-2">
                <button onClick={submitNew} className="rounded-lg bg-ember-600 px-4 py-2 font-mono text-xs font-bold text-white hover:bg-ember-500">
                  Submit
                </button>
                <button onClick={() => setCreating(false)} className="rounded-lg border border-forge-border px-4 py-2 font-mono text-xs text-iron-400 hover:text-zinc-200">
                  Cancel
                </button>
              </div>
            </div>
          ) : open ? (
            <div className="flex h-full flex-col">
              <div className="mb-3 border-b border-forge-border pb-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-base font-bold text-zinc-100">{open.subject}</h3>
                  <StatusPill status={open.status} />
                </div>
                <div className="mt-1 font-mono text-[11px] text-iron-500">
                  {open.moduleId ? allModules.find((m) => m.id === open.moduleId)?.title || "Lab" : "General"} ·{" "}
                  <span className={priColor(open.priority)}>{open.priority} priority</span>
                </div>
              </div>

              <div className="max-h-72 flex-1 space-y-3 overflow-y-auto pr-1">
                {open.messages.map((msg, i) => (
                  <div key={i} className={cn("flex", msg.role === "educator" ? "justify-start" : "justify-end")}>
                    <div
                      className={cn(
                        "max-w-[85%] rounded-xl px-3 py-2 text-sm",
                        msg.role === "educator" ? "bg-ember-500/10 text-ember-100" : "bg-forge-bg text-zinc-200"
                      )}
                    >
                      <div className="mb-0.5 flex items-center gap-2 font-mono text-[10px] text-iron-500">
                        <span className={msg.role === "educator" ? "text-ember-400" : "text-neon-cyan"}>{msg.fromName}</span>
                        <span>{timeAgo(msg.ts)}</span>
                      </div>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              {open.status !== "closed" && (
                <div className="mt-3 flex gap-2">
                  <input
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendReply()}
                    placeholder={user.role === "educator" ? "Answer the player…" : "Add a reply…"}
                    className="flex-1 rounded-lg border border-forge-border bg-forge-bg px-3 py-2 text-sm text-zinc-100 outline-none focus:border-ember-500"
                  />
                  <button onClick={sendReply} className="rounded-lg bg-ember-600 px-4 py-2 font-mono text-xs font-bold text-white hover:bg-ember-500">
                    Send
                  </button>
                  {user.role === "educator" && (
                    <button
                      onClick={() => {
                        db.setTicketStatus(open.id, "closed");
                        refresh();
                      }}
                      className="rounded-lg border border-forge-border px-3 py-2 font-mono text-xs text-iron-400 hover:border-red-500 hover:text-red-400"
                    >
                      Close
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex h-full min-h-40 items-center justify-center text-sm text-iron-500">
              Select a ticket to view the conversation.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: db.Ticket["status"] }) {
  const map = {
    open: "bg-amber-500/15 text-amber-300",
    answered: "bg-neon-green/15 text-neon-green",
    closed: "bg-forge-bg text-iron-500",
  };
  return <span className={cn("rounded-full px-2 py-0.5 font-mono text-[10px] font-bold uppercase", map[status])}>{status}</span>;
}

function priColor(p: db.Ticket["priority"]): string {
  return p === "high" ? "text-red-400" : p === "normal" ? "text-ember-400" : "text-iron-500";
}
