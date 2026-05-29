import { Link } from "@tanstack/react-router";
import { ChevronLeft, FileText } from "lucide-react";
import type { ReactNode } from "react";

export function LegalShell({
  title,
  updatedAt,
  children,
  back = "/profile",
}: {
  title: string;
  updatedAt?: string;
  children: ReactNode;
  back?: string;
}) {
  return (
    <div className="flex h-full flex-col bg-warm" dir="rtl">
      <header className="bg-navy text-warm px-5 pt-12 pb-5 rounded-b-3xl shadow-md">
        <div className="flex items-center justify-between">
          <Link to={back as never} className="grid h-9 w-9 place-items-center rounded-full bg-white/10">
            <ChevronLeft className="h-5 w-5 rotate-180" />
          </Link>
          <h1 className="text-base font-bold">{title}</h1>
          <div className="grid h-9 w-9 place-items-center rounded-full bg-white/10">
            <FileText className="h-4 w-4" />
          </div>
        </div>
        {updatedAt && (
          <p className="mt-3 text-center text-[11px] text-warm/60">آخر تحديث: {updatedAt}</p>
        )}
      </header>

      <main className="flex-1 overflow-y-auto p-5">
        <article className="rounded-2xl bg-card border border-border p-5 space-y-4 text-sm leading-7 text-foreground">
          {children}
        </article>
        <p className="text-center text-[10px] text-muted-foreground mt-4 pb-2">
          Tissint © 2026 · جميع الحقوق محفوظة
        </p>
      </main>
    </div>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-base font-black text-orange mb-2">{title}</h2>
      <div className="text-foreground/90 space-y-2">{children}</div>
    </section>
  );
}
