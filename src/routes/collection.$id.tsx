import { createFileRoute, Link } from "@tanstack/react-router";
import { useApp } from "@/lib/store";
import { MeteoriteThumb } from "@/components/tissint/meteorite-thumb";
import { ChevronRight, Trash2, Store } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/collection/$id")({ component: ItemPage });

function ItemPage() {
  const { id } = Route.useParams();
  const { collection, removeFromCollection } = useApp();
  const nav = useNavigate();
  const item = collection.find((c) => c.id === id);

  if (!item)
    return (
      <div className="p-6 text-center" dir="rtl">
        <p>غير موجود</p>
        <Link to="/collection" className="text-orange">
          العودة
        </Link>
      </div>
    );

  return (
    <div className="flex h-full flex-col" dir="rtl">
      <header className="bg-navy text-warm px-5 pt-12 pb-4 flex items-center justify-between">
        <Link
          to="/collection"
          className="grid h-10 w-10 place-items-center rounded-full bg-white/10"
        >
          <ChevronRight className="h-5 w-5" />
        </Link>
        <h1 className="font-bold">{item.name}</h1>
        <button
          onClick={() => {
            removeFromCollection(item.id);
            toast.success("تم الحذف");
            nav({ to: "/collection" });
          }}
          className="grid h-10 w-10 place-items-center rounded-full bg-destructive/30"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto">
        <MeteoriteThumb seed={item.imageSeed} className="aspect-square" />
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">{item.classification}</h2>
            <span className="text-3xl font-black text-primary">{item.score}</span>
          </div>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl bg-muted p-3">
              <dt className="text-xs text-muted-foreground">الوزن</dt>
              <dd className="font-bold">{item.weightG ?? "—"} g</dd>
            </div>
            <div className="rounded-xl bg-muted p-3">
              <dt className="text-xs text-muted-foreground">المنطقة</dt>
              <dd className="font-bold">{item.origin ?? "—"}</dd>
            </div>
            <div className="rounded-xl bg-muted p-3 col-span-2">
              <dt className="text-xs text-muted-foreground">التاريخ</dt>
              <dd className="font-bold">{item.createdAt}</dd>
            </div>
          </dl>
          {item.notes && <p className="text-sm text-muted-foreground">{item.notes}</p>}
          <button
            onClick={() => nav({ to: "/market" })}
            className="w-full rounded-xl bg-orange text-white py-3 font-bold flex items-center justify-center gap-2"
          >
            <Store className="h-4 w-4" /> نشر في السوق
          </button>
        </div>
      </main>
    </div>
  );
}
