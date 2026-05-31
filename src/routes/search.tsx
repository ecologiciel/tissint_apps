import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useApp } from "@/lib/store";
import { TabBar } from "@/components/tissint/tab-bar";
import { MeteoriteThumb } from "@/components/tissint/meteorite-thumb";
import { EmptyState } from "@/components/tissint/skeleton";
import {
  ChevronLeft,
  Search as SearchIcon,
  X,
  Store,
  Library,
  MessageCircle,
  ScanLine,
} from "lucide-react";

export const Route = createFileRoute("/search")({ component: SearchPage });

type Scope = "all" | "market" | "collection" | "messages";

const RECENT_KEY = "tissint_recent_searches";

function SearchPage() {
  const { listings, collection, conversations } = useApp();
  const [q, setQ] = useState("");
  const [scope, setScope] = useState<Scope>("all");
  const [recent, setRecent] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
    } catch {
      return [];
    }
  });

  const saveRecent = (term: string) => {
    if (!term.trim() || typeof window === "undefined") return;
    const next = [term, ...recent.filter((r) => r !== term)].slice(0, 6);
    setRecent(next);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  };

  const clearRecent = () => {
    setRecent([]);
    if (typeof window !== "undefined") localStorage.removeItem(RECENT_KEY);
  };

  const match = (s: string) => q === "" || s.toLowerCase().includes(q.toLowerCase());

  const mResults = useMemo(
    () =>
      listings.filter(
        (l) =>
          l.status === "approved" && (match(l.title) || match(l.classification) || match(l.region)),
      ),
    [listings, q],
  );
  const cResults = useMemo(
    () => collection.filter((c) => match(c.name) || match(c.classification)),
    [collection, q],
  );
  const tResults = useMemo(
    () =>
      conversations.filter(
        (c) => match(c.listingTitle ?? "") || match(c.peerName) || match(c.lastMessage),
      ),
    [conversations, q],
  );

  const total = mResults.length + cResults.length + tResults.length;
  const showSection = (s: Scope) => scope === "all" || scope === s;
  const trending = ["Chondrite", "تيسنت", "Pallasite", "Erfoud", "غير مصنف"];

  return (
    <div className="flex h-full flex-col bg-warm" dir="rtl">
      <header className="bg-navy text-warm px-5 pt-12 pb-4 rounded-b-3xl">
        <div className="flex items-center gap-2">
          <Link
            to="/dashboard"
            className="grid h-9 w-9 place-items-center rounded-full bg-white/10"
          >
            <ChevronLeft className="h-5 w-5 rotate-180" />
          </Link>
          <div className="relative flex-1">
            <SearchIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-warm/50" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              autoFocus
              onBlur={() => saveRecent(q)}
              placeholder="ابحث في كل التطبيق…"
              className="w-full rounded-xl bg-white/10 pr-10 pl-9 py-2.5 text-sm outline-none placeholder:text-warm/40"
            />
            {q && (
              <button
                onClick={() => setQ("")}
                className="absolute left-2 top-1/2 -translate-y-1/2 grid h-6 w-6 place-items-center rounded-full bg-white/10"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
        <div className="mt-3 flex gap-1.5 overflow-x-auto">
          {(
            [
              { id: "all", label: "الكل", icon: SearchIcon, n: total },
              { id: "market", label: "السوق", icon: Store, n: mResults.length },
              { id: "collection", label: "المجموعة", icon: Library, n: cResults.length },
              { id: "messages", label: "الرسائل", icon: MessageCircle, n: tResults.length },
            ] as const
          ).map((t) => {
            const I = t.icon;
            const active = scope === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setScope(t.id)}
                className={`shrink-0 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${active ? "bg-orange text-white" : "bg-white/10"}`}
              >
                <I className="h-3.5 w-3.5" />
                {t.label}
                {q && <span className="text-[9px] opacity-70">({t.n})</span>}
              </button>
            );
          })}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-5 space-y-5">
        {q === "" && (
          <>
            {recent.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-black text-muted-foreground">عمليات بحث حديثة</h3>
                  <button onClick={clearRecent} className="text-[10px] text-orange font-bold">
                    مسح
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {recent.map((r) => (
                    <button
                      key={r}
                      onClick={() => setQ(r)}
                      className="rounded-full bg-muted px-3 py-1.5 text-xs font-semibold"
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </section>
            )}
            <section>
              <h3 className="text-xs font-black text-muted-foreground mb-2">رائج الآن</h3>
              <div className="flex flex-wrap gap-1.5">
                {trending.map((t) => (
                  <button
                    key={t}
                    onClick={() => setQ(t)}
                    className="rounded-full bg-gradient-to-r from-orange/10 to-gold/10 border border-gold/20 px-3 py-1.5 text-xs font-bold text-orange"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </section>
            <section>
              <h3 className="text-xs font-black text-muted-foreground mb-2">إجراءات سريعة</h3>
              <div className="grid grid-cols-2 gap-2">
                <QuickAction to="/scan" icon={ScanLine} label="فحص جديد" />
                <QuickAction to="/market" icon={Store} label="تصفّح السوق" />
                <QuickAction to="/collection" icon={Library} label="مجموعتي" />
                <QuickAction to="/messages" icon={MessageCircle} label="الرسائل" />
              </div>
            </section>
          </>
        )}

        {q !== "" && total === 0 && (
          <EmptyState
            icon={SearchIcon}
            title="لا توجد نتائج"
            body={`لم نجد شيئاً لـ "${q}". جرّب كلمات أخرى.`}
          />
        )}

        {q !== "" && showSection("market") && mResults.length > 0 && (
          <Section title="السوق" count={mResults.length}>
            <div className="grid grid-cols-2 gap-2">
              {mResults.slice(0, 6).map((l) => (
                <Link
                  key={l.id}
                  to="/market/$listingId"
                  params={{ listingId: l.id }}
                  className="rounded-xl bg-card border overflow-hidden"
                >
                  <MeteoriteThumb seed={l.imageSeed} className="aspect-square" />
                  <div className="p-2">
                    <p className="text-[11px] font-bold truncate">{l.title}</p>
                    <p className="text-[10px] text-orange font-black">
                      {l.priceDh.toLocaleString()} د.م
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </Section>
        )}

        {q !== "" && showSection("collection") && cResults.length > 0 && (
          <Section title="مجموعتي" count={cResults.length}>
            <div className="space-y-2">
              {cResults.slice(0, 5).map((c) => (
                <Link
                  key={c.id}
                  to="/collection/$id"
                  params={{ id: c.id }}
                  className="flex items-center gap-3 rounded-xl bg-card border p-2"
                >
                  <MeteoriteThumb seed={c.imageSeed} className="h-12 w-12 rounded-lg shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{c.name}</p>
                    <p className="text-[11px] text-muted-foreground">{c.classification}</p>
                  </div>
                </Link>
              ))}
            </div>
          </Section>
        )}

        {q !== "" && showSection("messages") && tResults.length > 0 && (
          <Section title="الرسائل" count={tResults.length}>
            <div className="space-y-2">
              {tResults.slice(0, 5).map((c) => (
                <Link
                  key={c.id}
                  to="/messages/$threadId"
                  params={{ threadId: c.id }}
                  className="flex items-center gap-3 rounded-xl bg-card border p-2"
                >
                  <MeteoriteThumb
                    seed={c.listingImageSeed ?? "x"}
                    className="h-10 w-10 rounded-lg shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{c.peerName}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{c.lastMessage}</p>
                  </div>
                </Link>
              ))}
            </div>
          </Section>
        )}
      </main>
      <TabBar />
    </div>
  );
}

function Section({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-black">{title}</h3>
        <span className="text-[10px] text-muted-foreground font-bold">{count}</span>
      </div>
      {children}
    </section>
  );
}

function QuickAction({ to, icon: Icon, label }: { to: string; icon: any; label: string }) {
  return (
    <Link to={to as never} className="flex items-center gap-2 rounded-xl bg-card border p-3">
      <Icon className="h-4 w-4 text-orange" />
      <span className="text-xs font-bold">{label}</span>
    </Link>
  );
}
