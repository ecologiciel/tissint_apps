import { Link, useLocation } from "@tanstack/react-router";
import { Home, ScanLine, Library, Store, Crown } from "lucide-react";
import { useApp } from "@/lib/store";

type Tab = { to: string; label: string; icon: typeof Home; primary?: boolean };
const TABS: Tab[] = [
  { to: "/dashboard", label: "الرئيسية", icon: Home },
  { to: "/scan", label: "مسح", icon: ScanLine, primary: true },
  { to: "/collection", label: "مجموعتي", icon: Library },
  { to: "/market", label: "السوق", icon: Store },
  { to: "/premium", label: "Premium", icon: Crown },
];

export function TabBar() {
  const loc = useLocation();
  const { role } = useApp();
  return (
    <nav className="sticky bottom-0 z-30 border-t border-border bg-card/95 backdrop-blur px-2 pb-2 pt-2">
      <ul className="flex items-end justify-between gap-1">
        {TABS.map((t) => {
          const active = loc.pathname === t.to || loc.pathname.startsWith(t.to + "/");
          const Icon = t.icon;
          if (t.primary) {
            return (
              <li key={t.to} className="-mt-8">
                <Link to={t.to as never} className="flex flex-col items-center">
                  <span className="grid h-14 w-14 place-items-center rounded-full bg-secondary text-secondary-foreground shadow-lg ring-4 ring-background">
                    <Icon className="h-6 w-6" />
                  </span>
                  <span className="mt-1 text-[10px] font-bold text-secondary">{t.label}</span>
                </Link>
              </li>
            );
          }
          if (t.to === "/premium" && role === "premium") return null;
          return (
            <li key={t.to} className="flex-1">
              <Link
                to={t.to as never}
                className={`flex flex-col items-center gap-1 rounded-lg px-1 py-1.5 text-[11px] ${active ? "text-primary font-bold" : "text-muted-foreground"}`}
              >
                <Icon className="h-5 w-5" />
                <span>{t.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
