import { useState } from "react";
import {
  allEducators,
  allPlayers,
  getThread,
  inboxFor,
  markMessagesRead,
  sendChat,
  sendMessage,
  type User,
} from "../lib/db";
import { t, uppercaseLabel, type Lang } from "../i18n";
import Avatar from "./Avatar";
import { cn } from "../utils/cn";

export default function Messages({
  user,
  lang,
  withId,
  onChange,
}: {
  user: User;
  lang: Lang;
  withId?: string | null;
  onChange: () => void;
}) {
  const inbox = inboxFor(user.id);
  const [tab, setTab] = useState<"inbox" | "chat">(withId ? "chat" : "inbox");
  const [text, setText] = useState("");
  const [to, setTo] = useState(withId || "");
  const [broadcast, setBroadcast] = useState("");

  const peers = user.role === "educator" ? allPlayers() : [...allPlayers().filter((p) => p.id !== user.id), ...allEducators()];
  const peer = peers.find((p) => p.id === to) || peers.find((p) => p.id === withId);
  const thread = peer ? getThread(user.id, peer.id) : null;

  return (
    <div className="w-full space-y-4">
      <h1 className="text-2xl font-bold">{t("messages", lang)}</h1>
      <div className="flex gap-2">
        {(["inbox", "chat"] as const).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setTab(k)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-semibold border",
              tab === k ? "border-cyan-500 bg-cyan-500/15 text-cyan-300" : "border-gamehack-border text-iron-400"
            )}
          >
            {k === "inbox" ? t("openInbox", lang) : t("chat", lang)}
          </button>
        ))}
      </div>

      {tab === "inbox" && (
        <div className="space-y-3">
          {user.role === "educator" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!broadcast.trim()) return;
                sendMessage(user, "broadcast", broadcast.trim());
                setBroadcast("");
                onChange();
              }}
              className="glass rounded-2xl border border-gamehack-border p-4 space-y-2"
            >
              <div className="text-sm uppercase tracking-widest text-iron-400">{uppercaseLabel(t("broadcast", lang), lang)}</div>
              <textarea
                value={broadcast}
                onChange={(e) => setBroadcast(e.target.value)}
                className="w-full rounded-xl bg-gamehack-bg border border-gamehack-border p-3 text-sm"
                rows={3}
              />
              <button type="submit" className="rounded-lg bg-cyan-600 px-3 py-1.5 text-sm font-semibold">
                {t("send", lang)}
              </button>
            </form>
          )}
          <button
            type="button"
            onClick={() => {
              markMessagesRead(user.id);
              onChange();
            }}
            className="text-sm text-iron-400 hover:text-cyan-400"
          >
            mark read
          </button>
          {inbox.length === 0 && <p className="text-sm text-iron-500">{t("noMessages", lang)}</p>}
          {inbox.map((m) => (
            <div
              key={m.id}
              className={cn("glass rounded-xl border p-3 text-sm", m.read ? "border-gamehack-border" : "border-cyan-600/40")}
            >
              <div className="text-sm text-iron-400">
                {m.fromName} {m.broadcast ? `, ${t("broadcast", lang)}` : ""}, {new Date(m.ts).toLocaleString()}
              </div>
              <div className="mt-1 text-zinc-200">{m.text}</div>
            </div>
          ))}
        </div>
      )}

      {tab === "chat" && (
        <div className="glass rounded-2xl border border-gamehack-border overflow-hidden">
          <div className="p-3 border-b border-gamehack-border flex gap-2 overflow-auto">
            {peers.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setTo(p.id)}
                className={cn("flex items-center gap-2 rounded-full border px-2 py-1 text-sm", to === p.id ? "border-cyan-500" : "border-gamehack-border")}
              >
                <Avatar src={p.avatar} name={p.displayName} size={18} />
                {p.displayName.split(" ")[0]}
              </button>
            ))}
          </div>
          <div className="h-72 overflow-auto p-4 space-y-2">
            {thread?.messages.map((m) => (
              <div key={m.id} className={cn("text-sm max-w-[80%] rounded-xl px-3 py-2", m.fromId === user.id ? "ml-auto bg-cyan-600/30" : "bg-gamehack-bg")}>
                {m.text}
              </div>
            ))}
          </div>
          {peer && (
            <form
              className="flex gap-2 p-3 border-t border-gamehack-border"
              onSubmit={(e) => {
                e.preventDefault();
                if (!text.trim()) return;
                sendChat(user.id, peer.id, text.trim());
                setText("");
                onChange();
              }}
            >
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={t("writeMessage", lang)}
                className="min-w-0 flex-1 rounded-lg bg-gamehack-bg border border-gamehack-border px-3 py-2 text-sm"
              />
              <button type="submit" className="rounded-lg bg-cyan-600 px-3 py-2 text-sm font-semibold">
                {t("send", lang)}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
