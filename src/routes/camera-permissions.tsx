import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Camera, MapPin, Bell, Check, ChevronLeft } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/camera-permissions")({ component: PermissionsPage });

type PermKey = "camera" | "location" | "notifications";
type PermState = "idle" | "granted" | "denied";

function PermissionsPage() {
  const nav = useNavigate();
  const [state, setState] = useState<Record<PermKey, PermState>>({
    camera: "idle",
    location: "idle",
    notifications: "idle",
  });

  const perms: { key: PermKey; icon: any; title: string; desc: string; required: boolean }[] = [
    {
      key: "camera",
      icon: Camera,
      title: "الكاميرا",
      desc: "لمسح الأحجار وتحليلها بصرياً",
      required: true,
    },
    {
      key: "location",
      icon: MapPin,
      title: "الموقع",
      desc: "لتحديد منطقة الاكتشاف (اختياري)",
      required: false,
    },
    {
      key: "notifications",
      icon: Bell,
      title: "الإشعارات",
      desc: "تنبيهات الرسائل والصفقات",
      required: false,
    },
  ];

  const request = async (key: PermKey) => {
    try {
      if (key === "camera" && navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach((t) => t.stop());
      } else if (key === "location" && navigator.geolocation) {
        await new Promise((res, rej) => navigator.geolocation.getCurrentPosition(res, rej));
      } else if (key === "notifications" && "Notification" in window) {
        const p = await Notification.requestPermission();
        if (p !== "granted") throw new Error("denied");
      }
      setState((s) => ({ ...s, [key]: "granted" }));
      toast.success("تم منح الإذن");
    } catch {
      setState((s) => ({ ...s, [key]: "denied" }));
      toast.error("تم الرفض");
    }
  };

  const canContinue = state.camera === "granted";

  return (
    <div className="flex h-full flex-col bg-background" dir="rtl">
      <header className="flex items-center gap-3 px-5 pt-12 pb-4">
        <Link
          to="/onboarding"
          className="grid h-10 w-10 place-items-center rounded-full bg-card border"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-bold">الأذونات</h1>
      </header>

      <main className="flex-1 overflow-y-auto px-5 space-y-3">
        <p className="text-sm text-muted-foreground mb-2">
          يحتاج تيسنت لبعض الأذونات للعمل بأفضل شكل
        </p>
        {perms.map((p) => {
          const Icon = p.icon;
          const s = state[p.key];
          return (
            <div key={p.key} className="rounded-2xl bg-card border p-4 flex items-center gap-3">
              <div
                className={`grid h-12 w-12 place-items-center rounded-xl ${s === "granted" ? "bg-success/15 text-success" : "bg-primary/10 text-primary"}`}
              >
                {s === "granted" ? <Check className="h-6 w-6" /> : <Icon className="h-6 w-6" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm">{p.title}</h3>
                  {p.required && (
                    <span className="text-[10px] rounded-full bg-orange/15 text-orange px-2 py-0.5">
                      إلزامي
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{p.desc}</p>
              </div>
              <button
                onClick={() => request(p.key)}
                disabled={s === "granted"}
                className="rounded-full bg-primary text-primary-foreground text-xs font-bold px-4 py-2 disabled:opacity-50"
              >
                {s === "granted" ? "✓" : s === "denied" ? "إعادة" : "السماح"}
              </button>
            </div>
          );
        })}
      </main>

      <footer className="p-5 space-y-2">
        <button
          onClick={() => nav({ to: "/dashboard" })}
          disabled={!canContinue}
          className="w-full rounded-full bg-orange text-white py-3 font-bold disabled:opacity-40"
        >
          متابعة
        </button>
        <button
          onClick={() => nav({ to: "/dashboard" })}
          className="w-full text-xs text-muted-foreground py-2"
        >
          تخطي الآن
        </button>
      </footer>
    </div>
  );
}
