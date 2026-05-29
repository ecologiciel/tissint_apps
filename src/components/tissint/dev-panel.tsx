import { useApp } from "@/lib/store";
import { TISSINT_API_MODE } from "@/lib/tissint-api";
import { Settings2, X } from "lucide-react";
import type { ScenarioKey, UserRole } from "@/lib/tissint-types";

const SCENARIOS: { k: ScenarioKey; label: string }[] = [
  { k: "A", label: "أ — قبول قوي (87%)" },
  { k: "B", label: "ب — متوسط، يطلب داخلي (62%)" },
  { k: "C", label: "ج — ضعيف (34%)" },
  { k: "D", label: "د — مرفوض (8%)" },
];

const ROLES: { k: UserRole; label: string }[] = [
  { k: "guest", label: "زائر" },
  { k: "free", label: "مجاني" },
  { k: "premium", label: "Premium" },
  { k: "admin", label: "Admin" },
];

export function DevPanel() {
  const { devPanelOpen, toggleDevPanel, scenario, setScenario, role, setRole, scansToday, resetScans, dailyLimit } = useApp();

  return (
    <>
      <button onClick={toggleDevPanel}
        className="fixed bottom-4 left-4 z-50 grid h-10 w-10 place-items-center rounded-full bg-stone text-warm shadow-lg hover:scale-105 transition"
        title="Dev panel">
        <Settings2 className="h-5 w-5" />
      </button>
      {devPanelOpen && (
        <div className="fixed bottom-16 left-4 z-50 w-72 rounded-2xl bg-stone text-warm shadow-2xl p-4 border border-white/10" dir="rtl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm">لوحة المطور</h3>
            <button onClick={toggleDevPanel}><X className="h-4 w-4" /></button>
          </div>
          <div className="space-y-3 text-xs">
            <div>
              <p className="opacity-70 mb-1">API: <span className="font-mono">{TISSINT_API_MODE}</span></p>
              <p className="opacity-70">المسح اليومي: {scansToday}/{dailyLimit === 999 ? "∞" : dailyLimit}</p>
              <button onClick={resetScans} className="mt-1 text-orange underline">إعادة تصفير</button>
            </div>
            <div>
              <p className="font-semibold mb-1">السيناريو AI</p>
              <div className="grid gap-1">
                {SCENARIOS.map((s) => (
                  <button key={s.k} onClick={() => setScenario(s.k)}
                    className={`text-right rounded px-2 py-1.5 ${scenario === s.k ? "bg-orange text-white" : "bg-white/10"}`}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="font-semibold mb-1">الدور</p>
              <div className="flex flex-wrap gap-1">
                {ROLES.map((r) => (
                  <button key={r.k} onClick={() => { setRole(r.k); resetScans(); }}
                    className={`rounded px-2 py-1 ${role === r.k ? "bg-orange text-white" : "bg-white/10"}`}>
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
