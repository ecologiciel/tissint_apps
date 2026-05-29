import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useApp } from "@/lib/store";
import { TabBar } from "@/components/tissint/tab-bar";
import {
  Bell, CheckCheck, ChevronLeft, MessageCircle, ScanLine,
  ShieldCheck, ShieldX, Crown, Info,
} from "lucide-react";
import type { NotificationKind } from "@/lib/tissint-types";

export const Route = createFileRoute("/notifications")({ component: NotificationsPage });

const ICONS: Record<NotificationKind, { icon: typeof Bell; color: string; bg: string }> = {
  new_message:      { icon: MessageCircle, color: "text-primary", bg: "bg-primary/10" },
  scan_done:        { icon: ScanLine,      color: "text-orange",  bg: "bg-orange/10"  },
  listing_approved: { icon: ShieldCheck,   color: "text-success", bg: "bg-success/10" },
  listing_rejected: { icon: ShieldX,       color: "text-destructive", bg: "bg-destructive/10" },
  offer:            { icon: Bell,          color: "text-gold",    bg: "bg-gold/10"    },
  premium:          { icon: Crown,         color: "text-gold",    bg: "bg-gold/10"    },
  system:           { icon: Info,          color: "text-muted-foreground", bg: "bg-muted" },
};

function relTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "الآن";
  if (m < 60) return `${m} د`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} س`;
  return `${Math.floor(h / 24)} ي`;
}

function NotificationsPage() {
  const nav = useNavigate();
  const { notifications, markNotificationRead, markAllNotificationsRead, unreadNotifications } = useApp();
  const sorted = [...notifications].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

  const handleOpen = (id: string, linkTo?: string, params?: Record<string, string>) => {
    markNotificationRead(id);
    if (!linkTo) return;
    nav({ to: linkTo as never, params: params as never });
  };

  return (
    <div className="flex h-full flex-col bg-warm" dir="rtl">
      <header className="bg-navy text-warm px-5 pt-12 pb-5 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between">
          <Link to="/dashboard" className="grid h-9 w-9 place-items-center rounded-full bg-white/10">
            <ChevronLeft className="h-5 w-5 rotate-180" />
          </Link>
          <h1 className="text-base font-bold">الإشعارات</h1>
          <button
            onClick={markAllNotificationsRead}
            disabled={unreadNotifications === 0}
            className="text-[11px] font-bold bg-white/10 rounded-full px-3 py-1.5 flex items-center gap-1 disabled:opacity-40"
          >
            <CheckCheck className="h-3.5 w-3.5" /> الكل
          </button>
        </div>
        {unreadNotifications > 0 && (
          <p className="text-xs text-gold mt-3">{unreadNotifications} غير مقروءة</p>
        )}
      </header>

      <main className="flex-1 overflow-y-auto px-3 py-3">
        {sorted.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">
            <Bell className="mx-auto h-10 w-10 mb-2 opacity-50" />
            <p>لا توجد إشعارات</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {sorted.map((n) => {
              const meta = ICONS[n.kind];
              const Icon = meta.icon;
              return (
                <li key={n.id}>
                  <button
                    onClick={() => handleOpen(n.id, n.linkTo, n.linkParams)}
                    className={`w-full text-right flex items-start gap-3 rounded-2xl border p-3 transition ${
                      n.read ? "bg-card border-border" : "bg-card border-orange/40 shadow-sm"
                    }`}
                  >
                    <span className={`grid h-10 w-10 place-items-center rounded-xl shrink-0 ${meta.bg} ${meta.color}`}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-bold text-sm truncate">{n.title}</p>
                        <span className="text-[10px] text-muted-foreground shrink-0">{relTime(n.createdAt)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{n.body}</p>
                    </div>
                    {!n.read && <span className="mt-1 h-2 w-2 rounded-full bg-orange shrink-0" />}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </main>

      <TabBar />
    </div>
  );
}
