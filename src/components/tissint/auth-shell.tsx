import { Link } from "@tanstack/react-router";
import { ChevronLeft, Sparkles } from "lucide-react";
import type { ReactNode } from "react";

interface Props {
  title: string;
  subtitle?: string;
  back?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthShell({ title, subtitle, back, children, footer }: Props) {
  return (
    <div className="flex h-full flex-col bg-stone text-warm" dir="rtl">
      <div className="relative px-5 pt-10 pb-6">
        {back && (
          <Link
            to={back as never}
            className="absolute top-10 right-5 grid h-9 w-9 place-items-center rounded-full bg-white/10"
          >
            <ChevronLeft className="h-5 w-5 rotate-180" />
          </Link>
        )}
        <div className="flex flex-col items-center text-center mt-6">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-orange to-gold shadow-lg">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h1 className="mt-4 text-2xl font-black text-gold">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-warm/70 max-w-xs">{subtitle}</p>}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-5">
        <div className="rounded-3xl bg-warm text-stone p-5 shadow-2xl">{children}</div>
        {footer && <div className="mt-5 text-center text-sm text-warm/80">{footer}</div>}
      </div>
    </div>
  );
}

export function AuthInput({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  icon: Icon,
  dir = "rtl",
  maxLength,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  icon?: any;
  dir?: "rtl" | "ltr";
  maxLength?: number;
}) {
  return (
    <label className="block mb-3">
      <span className="block text-xs font-bold text-stone/80 mb-1.5">{label}</span>
      <div className="flex items-center gap-2 rounded-xl border border-stone/15 bg-white px-3 py-2.5 focus-within:border-orange focus-within:ring-2 focus-within:ring-orange/20">
        {Icon && <Icon className="h-4 w-4 text-stone/50 shrink-0" />}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          dir={dir}
          maxLength={maxLength}
          className="flex-1 bg-transparent outline-none text-sm placeholder:text-stone/40"
        />
      </div>
    </label>
  );
}

export function AuthButton({
  children,
  onClick,
  variant = "primary",
  loading,
  type = "button",
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost" | "social";
  loading?: boolean;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  const base =
    "w-full rounded-xl py-3 text-sm font-bold transition active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2";
  const styles = {
    primary: "bg-gradient-to-r from-orange to-gold text-white shadow-md",
    ghost: "bg-stone/5 text-stone border border-stone/10",
    social: "bg-white text-stone border border-stone/15 shadow-sm",
  }[variant];
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${styles}`}
    >
      {loading ? "..." : children}
    </button>
  );
}
