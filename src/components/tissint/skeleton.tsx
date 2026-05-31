import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted ${className}`} />;
}

export function ListingSkeleton() {
  return (
    <div className="rounded-2xl bg-card border overflow-hidden">
      <Skeleton className="aspect-square rounded-none" />
      <div className="p-2.5 space-y-2">
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="h-2 w-1/2" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}

export function ListingGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <ListingSkeleton key={i} />
      ))}
    </div>
  );
}

export function RowSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-card border p-3">
      <Skeleton className="h-12 w-12 rounded-lg shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="h-2 w-1/3" />
      </div>
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  body,
  actionLabel,
  actionTo,
  onAction,
}: {
  icon: any;
  title: string;
  body?: string;
  actionLabel?: string;
  actionTo?: string;
  onAction?: () => void;
}) {
  const btnClass =
    "mt-4 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-orange to-gold text-white text-xs font-bold px-5 py-2.5 shadow-md";
  return (
    <div className="rounded-3xl bg-card border border-border p-8 text-center" dir="rtl">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-orange/15 to-gold/10">
        <Icon className="h-8 w-8 text-orange" />
      </div>
      <h3 className="mt-4 text-base font-black">{title}</h3>
      {body && (
        <p className="mt-1 text-xs text-muted-foreground leading-5 max-w-xs mx-auto">{body}</p>
      )}
      {actionLabel && actionTo && (
        <Link to={actionTo as never} className={btnClass}>
          {actionLabel}
        </Link>
      )}
      {actionLabel && onAction && !actionTo && (
        <button onClick={onAction} className={btnClass}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export function PageLoader({ label = "جاري التحميل…" }: { label?: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3" dir="rtl">
      <div className="h-10 w-10 rounded-full border-4 border-orange/20 border-t-orange animate-spin" />
      <p className="text-xs text-muted-foreground font-semibold">{label}</p>
    </div>
  );
}

export function SectionLoader({ children }: { children?: ReactNode }) {
  return (
    <div className="space-y-2 animate-pulse">
      {children ?? Array.from({ length: 3 }).map((_, i) => <RowSkeleton key={i} />)}
    </div>
  );
}
