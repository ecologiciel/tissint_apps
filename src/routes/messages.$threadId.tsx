import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useApp } from "@/lib/store";
import { MeteoriteThumb } from "@/components/tissint/meteorite-thumb";
import { BadgeCheck, ChevronRight, Send, Shield } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/messages/$threadId")({ component: Thread });

function Thread() {
  const { threadId } = Route.useParams();
  const nav = useNavigate();
  const { conversations, messages, sendMessage, markThreadRead } = useApp();
  const conv = conversations.find((c) => c.id === threadId);
  const thread = messages.filter((m) => m.threadId === threadId);
  const [text, setText] = useState("");
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    markThreadRead(threadId);
  }, [threadId, markThreadRead]);
  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: "smooth" });
  }, [thread.length]);

  if (!conv) {
    return (
      <div className="p-6" dir="rtl">
        <p>محادثة غير موجودة</p>
        <Link to="/messages" className="text-orange">
          العودة
        </Link>
      </div>
    );
  }

  const handleSend = () => {
    const t = text.trim();
    if (!t) return;
    sendMessage(threadId, t);
    setText("");
  };

  return (
    <div className="flex h-full flex-col bg-warm" dir="rtl">
      <header className="bg-navy text-warm px-4 pt-12 pb-3 rounded-b-2xl shadow-lg flex items-center gap-3">
        <button
          onClick={() => nav({ to: "/messages" })}
          className="grid h-9 w-9 place-items-center rounded-full bg-white/10"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
        <MeteoriteThumb
          seed={conv.listingImageSeed || conv.peerName}
          className="h-10 w-10 rounded-xl"
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold flex items-center gap-1 truncate">
            {conv.peerName}
            {conv.peerVerified && <BadgeCheck className="h-3.5 w-3.5 text-gold shrink-0" />}
          </p>
          <p className="text-[11px] text-warm/70 truncate">{conv.listingTitle}</p>
        </div>
        {conv.listingId && (
          <Link
            to="/market/$listingId"
            params={{ listingId: conv.listingId }}
            className="text-[11px] font-bold bg-white/10 rounded-full px-3 py-1.5"
          >
            عرض
          </Link>
        )}
      </header>

      <div className="px-4 py-2 bg-muted/40 border-b border-border flex items-start gap-2 text-[11px] text-muted-foreground">
        <Shield className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary" />
        <span>لا تشارك بيانات حساسة. التحقق والمعاينة قبل أي دفع.</span>
      </div>

      <main ref={scrollerRef} className="flex-1 overflow-y-auto px-3 py-4 space-y-2">
        {thread.map((m) => (
          <div key={m.id} className={`flex ${m.fromMe ? "justify-start" : "justify-end"}`}>
            <div
              className={`max-w-[78%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
                m.fromMe
                  ? "bg-primary text-primary-foreground rounded-bl-sm"
                  : "bg-card border border-border rounded-br-sm"
              }`}
            >
              <p className="leading-snug">{m.text}</p>
              <p
                className={`text-[10px] mt-0.5 ${m.fromMe ? "text-primary-foreground/70" : "text-muted-foreground"}`}
              >
                {new Date(m.createdAt).toLocaleTimeString("ar", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}
      </main>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="border-t bg-card p-2 flex items-center gap-2"
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="اكتب رسالة…"
          className="flex-1 rounded-full bg-muted px-4 py-2.5 text-sm outline-none"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="grid h-10 w-10 place-items-center rounded-full bg-orange text-white disabled:opacity-40"
        >
          <Send className="h-4 w-4 -scale-x-100" />
        </button>
      </form>
    </div>
  );
}
