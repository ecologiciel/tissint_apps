import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { useApp } from "@/lib/store";
import { TabBar } from "@/components/tissint/tab-bar";
import { MeteoriteThumb } from "@/components/tissint/meteorite-thumb";
import { BadgeCheck, ChevronLeft, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/messages")({ component: MessagesLayout });

function MessagesLayout() {
  const loc = useLocation();
  // When on a sub-route /messages/:id, render the child only.
  if (loc.pathname !== "/messages") return <Outlet />;
  return <MessagesIndex />;
}

function relTime(iso: string) {
  const d = new Date(iso).getTime();
  const diff = Date.now() - d;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "الآن";
  if (m < 60) return `${m} د`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} س`;
  const j = Math.floor(h / 24);
  return `${j} ي`;
}

function MessagesIndex() {
  const { conversations } = useApp();
  const sorted = [...conversations].sort((a, b) => +new Date(b.lastAt) - +new Date(a.lastAt));

  return (
    <div className="flex h-full flex-col bg-warm" dir="rtl">
      <header className="bg-navy text-warm px-5 pt-12 pb-5 rounded-b-3xl shadow-lg flex items-center justify-between">
        <Link to="/dashboard" className="grid h-9 w-9 place-items-center rounded-full bg-white/10">
          <ChevronLeft className="h-5 w-5 rotate-180" />
        </Link>
        <h1 className="text-base font-bold">الرسائل</h1>
        <div className="h-9 w-9" />
      </header>

      <main className="flex-1 overflow-y-auto px-3 py-3">
        {sorted.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">
            <MessageCircle className="mx-auto h-10 w-10 mb-2 opacity-50" />
            <p>لا توجد محادثات بعد</p>
            <Link to="/market" className="text-orange text-sm font-bold mt-2 inline-block">
              تصفح السوق
            </Link>
          </div>
        ) : (
          <ul className="space-y-1">
            {sorted.map((c) => (
              <li key={c.id}>
                <Link
                  to="/messages/$threadId"
                  params={{ threadId: c.id }}
                  className="flex items-center gap-3 rounded-2xl bg-card border border-border p-3 active:scale-[0.99] transition"
                >
                  <MeteoriteThumb
                    seed={c.listingImageSeed || c.peerName}
                    className="h-12 w-12 rounded-xl"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <p className="font-bold text-sm truncate">{c.peerName}</p>
                      {c.peerVerified && (
                        <BadgeCheck className="h-3.5 w-3.5 text-success shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate">{c.listingTitle}</p>
                    <p className="text-xs truncate mt-0.5">{c.lastMessage}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] text-muted-foreground">{relTime(c.lastAt)}</span>
                    {c.unread > 0 && (
                      <span className="grid h-5 min-w-5 px-1 place-items-center rounded-full bg-orange text-white text-[10px] font-bold">
                        {c.unread}
                      </span>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>

      <TabBar />
    </div>
  );
}
