import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

export function OfflineBanner() {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);
  if (online) return null;
  return (
    <div
      className="absolute top-0 inset-x-0 z-50 bg-destructive text-white px-4 py-2 flex items-center justify-center gap-2 text-xs font-bold animate-in slide-in-from-top"
      dir="rtl"
    >
      <WifiOff className="h-3.5 w-3.5" />
      أنت غير متصل بالإنترنت — تعمل بالوضع المخزّن
    </div>
  );
}
