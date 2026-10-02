import { useState, useEffect } from "react";
import * as db from "../lib/db";
import { timeAgo } from "./PlayerDashboard";
import Avatar from "./Avatar";
import Icon from "./Icon";
import { cn } from "../utils/cn";

export default function Messages({
  user,
  initialChatId,
  onOpenProfile,
}: {
  user: db.User;
  initialChatId?: string | null;
  onOpenProfile: (id: string) => void;
}) {
  const [, force] = useState(0);
  const refresh = () => force((x) => x + 1);
  const [tab, setTab] = useState<"inbox" | "chat">(initialChatId ? "chat" : "inbox");
  const [peerId, setPeerId] = useState<string | null>(initialChatId || null);
  const [text, setText] = useState("");

  useEffect(() => {
    db.markMessagesRead(user.id);
  }, [user.id]);

  const inbox = db.inboxFor(user.id);
  // people you can chat with: all other players (+ educators appear in inbox)
  const people = db.allPlayers().filter((p) => p.id !== user.id);
  const peer = peerId ? db.userById(peerId) : null;
  const thread = peer ? db.getThread(user.id, peer.id) : null;

  const send = () => {
    if (!text.trim() || !peer) return;
    db.sendChat(user.id, peer.id, text.trim());
    setText("");
    refresh();
  };

  return (
    <div className="w-full">
      <div className="enter enter-1 mb-5">
        <div className="font-mono text-xs uppercase tracking-[0.35em] text-ember-500">Communications</div>
        <h2 className="text-3xl font-black text-shine">Messages</h2>
      </div>

      <div className="mb-4 flex rounded-lg border border-forge-border bg-forge-bg p-1">
        {(["inbox", "chat"] as const).map((k) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={cn(
              "flex-1 rounded-md py-2 font-mono text-xs font-bold uppercase transition",
              tab === k ? "bg-ember-600 text-white" : "text-iron-400 hover:text-zinc-200"
            )}
          >
            {k === "inbox" ? `Inbox (${inbox.filter((m) => !m.read).length})` : "Chat"}
          </button>
        ))}
      </div>

      {tab === "inbox" ? (
        <div className="space-y-2">
          {inbox.length === 0 && (
            <div className="rounded-xl border border-forge-border bg-forge-panel p-8 text-center text-sm text-iron-500">
              No messages from educators yet.
            </div>
          )}
          {inbox.map((msg) => (
            <div key={msg.id} className="rounded-xl border border-forge-border bg-forge-panel p-4">
              <div className="mb-1 flex items-center gap-2">
                <Icon name={msg.broadcast ? "radar" : "crown"} className="h-4 w-4 text-ember-400" />
                <span className="font-mono text-sm font-bold text-ember-400">{msg.fromName}</span>
                {msg.broadcast && (
                  <span className="rounded-full bg-ember-500/15 px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-ember-400">
                    Broadcast
                  </span>
                )}
                <span className="ml-auto font-mono text-[10px] text-iron-500">{timeAgo(msg.ts)}</span>
              </div>
              <p className="text-sm text-zinc-200">{msg.text}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-[1fr_1.6fr]">
          {/* people list */}
          <div className="space-y-1.5">
            {people.map((p) => {
              const th = db.getThread(user.id, p.id);
              const last = th.messages[th.messages.length - 1];
              return (
                <button
                  key={p.id}
                  onClick={() => setPeerId(p.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left transition",
                    peerId === p.id ? "border-ember-500/60 bg-ember-500/5" : "border-forge-border bg-forge-panel hover:border-ember-500/40"
                  )}
                >
                  <Avatar name={p.displayName} src={p.avatar} size={36} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-bold text-zinc-100">{p.displayName}</div>
                    <div className="truncate font-mono text-[10px] text-iron-500">
                      {last ? last.text : "Start a conversation"}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* conversation */}
          <div className="flex flex-col rounded-xl border border-forge-border bg-forge-panel">
            {peer ? (
              <>
                <button
                  onClick={() => onOpenProfile(peer.id)}
                  className="flex items-center gap-3 border-b border-forge-border px-4 py-3 text-left hover:bg-forge-bg/50"
                >
                  <Avatar name={peer.displayName} src={peer.avatar} size={32} />
                  <span className="text-sm font-bold text-zinc-100">{peer.displayName}</span>
                  <span className="ml-auto font-mono text-[10px] text-iron-500">View profile →</span>
                </button>
                <div className="flex max-h-80 min-h-56 flex-1 flex-col gap-2 overflow-y-auto p-4">
                  {thread!.messages.length === 0 && (
                    <div className="m-auto text-sm text-iron-500">Say hello 👋</div>
                  )}
                  {thread!.messages.map((msg) => {
                    const mine = msg.fromId === user.id;
                    return (
                      <div key={msg.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                        <div
                          className={cn(
                            "max-w-[75%] rounded-2xl px-3 py-2 text-sm",
                            mine ? "bg-ember-600 text-white" : "bg-forge-bg text-zinc-200"
                          )}
                        >
                          {msg.text}
                          <div className={cn("mt-0.5 font-mono text-[9px]", mine ? "text-white/60" : "text-iron-600")}>
                            {timeAgo(msg.ts)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex gap-2 border-t border-forge-border p-3">
                  <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && send()}
                    placeholder="Type a message…"
                    className="flex-1 rounded-lg border border-forge-border bg-forge-bg px-3 py-2 text-sm text-zinc-100 outline-none focus:border-ember-500"
                  />
                  <button onClick={send} className="rounded-lg bg-ember-600 px-4 py-2 font-mono text-xs font-bold text-white hover:bg-ember-500">
                    Send
                  </button>
                </div>
              </>
            ) : (
              <div className="flex min-h-56 items-center justify-center text-sm text-iron-500">
                Pick someone to chat with.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
