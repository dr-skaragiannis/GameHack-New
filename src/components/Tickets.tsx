import { useState } from "react";
import { CAMPAIGNS } from "../data/lessons";
import { createTicket, replyTicket, setTicketStatus, ticketsFor, type Ticket, type User } from "../lib/db";
import { t, type Lang } from "../i18n";
import { cn } from "../utils/cn";

export default function Tickets({ user, lang, onChange }: { user: User; lang: Lang; onChange: () => void }) {
  const list = ticketsFor(user);
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [moduleId, setModuleId] = useState<string>("");
  const [priority, setPriority] = useState<Ticket["priority"]>("normal");
  const [active, setActive] = useState<string | null>(list[0]?.id || null);
  const [reply, setReply] = useState("");
  const tk = list.find((x) => x.id === active);
  const mods = CAMPAIGNS.flatMap((c) => c.modules);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">{t("tickets", lang)}</h1>
        {user.role === "player" && (
          <button type="button" onClick={() => setOpen(true)} className="rounded-lg bg-ember-600 px-3 py-1.5 text-sm font-semibold">
            {t("newTicket", lang)}
          </button>
        )}
      </div>

      {list.length === 0 && !open && <p className="text-sm text-iron-500">{t("noTickets", lang)}</p>}

      <div className="grid md:grid-cols-[280px_minmax(0,1fr)] gap-4">
        <ul className="space-y-2">
          {list.map((x) => (
            <li key={x.id}>
              <button
                type="button"
                onClick={() => setActive(x.id)}
                className={cn(
                  "w-full text-left rounded-xl border p-3 text-sm",
                  active === x.id ? "border-ember-500 bg-ember-500/10" : "border-forge-border"
                )}
              >
                <div className="font-semibold truncate">{x.subject}</div>
                <div className="text-sm text-iron-400">
                  {x.playerName} · {t(x.status, lang)} · {t(x.priority, lang)}
                </div>
              </button>
            </li>
          ))}
        </ul>
        {tk && (
          <div className="glass rounded-2xl border border-forge-border p-4">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div>
                <div className="font-bold">{tk.subject}</div>
                <div className="text-sm text-iron-400">
                  {tk.playerName} · {tk.moduleId || t("general", lang)}
                </div>
              </div>
              {user.role === "educator" && (
                <select
                  value={tk.status}
                  onChange={(e) => {
                    setTicketStatus(tk.id, e.target.value as Ticket["status"]);
                    onChange();
                  }}
                  className="bg-forge-bg border border-forge-border rounded-lg text-sm px-2 py-1"
                >
                  <option value="open">{t("open", lang)}</option>
                  <option value="answered">{t("answered", lang)}</option>
                  <option value="closed">{t("closed", lang)}</option>
                </select>
              )}
            </div>
            <div className="space-y-2 max-h-80 overflow-auto mb-3">
              {tk.messages.map((m, i) => (
                <div key={i} className="rounded-xl bg-forge-bg border border-forge-line p-3 text-sm">
                  <div className="text-sm text-iron-400">
                    {m.fromName} · {new Date(m.ts).toLocaleString()}
                  </div>
                  <div className="mt-1">{m.text}</div>
                </div>
              ))}
            </div>
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (!reply.trim()) return;
                replyTicket(tk.id, user, reply.trim());
                setReply("");
                onChange();
              }}
            >
              <input
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder={t("reply", lang)}
                className="flex-1 rounded-lg bg-forge-bg border border-forge-border px-3 py-2 text-sm"
              />
              <button type="submit" className="rounded-lg bg-ember-600 px-3 py-2 text-sm font-semibold">
                {t("send", lang)}
              </button>
            </form>
          </div>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" onClick={() => setOpen(false)}>
          <form
            className="w-full max-w-md glass rounded-2xl border border-forge-border p-5 space-y-3"
            onClick={(e) => e.stopPropagation()}
            onSubmit={(e) => {
              e.preventDefault();
              createTicket(user, subject || "Help", moduleId || null, body, priority);
              setOpen(false);
              setSubject("");
              setBody("");
              onChange();
            }}
          >
            <h3 className="font-bold">{t("newTicket", lang)}</h3>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={t("subject", lang)}
              className="w-full rounded-lg bg-forge-bg border border-forge-border px-3 py-2 text-sm"
            />
            <select
              value={moduleId}
              onChange={(e) => setModuleId(e.target.value)}
              className="w-full rounded-lg bg-forge-bg border border-forge-border px-3 py-2 text-sm"
            >
              <option value="">{t("general", lang)}</option>
              {mods.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title.en}
                </option>
              ))}
            </select>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Ticket["priority"])}
              className="w-full rounded-lg bg-forge-bg border border-forge-border px-3 py-2 text-sm"
            >
              <option value="low">{t("low", lang)}</option>
              <option value="normal">{t("normal", lang)}</option>
              <option value="high">{t("high", lang)}</option>
            </select>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              className="w-full rounded-lg bg-forge-bg border border-forge-border px-3 py-2 text-sm"
              required
            />
            <button type="submit" className="w-full rounded-lg bg-ember-600 py-2 font-semibold">
              {t("submitTicket", lang)}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
