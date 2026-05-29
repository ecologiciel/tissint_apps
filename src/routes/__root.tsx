import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet, Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { AppProvider } from "@/lib/store";
import { Toaster } from "@/components/ui/sonner";
import { DeviceFrame } from "@/components/tissint/device-frame";
import { DevPanel } from "@/components/tissint/dev-panel";
import { OfflineBanner } from "@/components/tissint/offline-banner";
import { useOfflineCache } from "@/lib/offline-cache";
import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4" dir="rtl">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold">404</h1>
        <p className="mt-2 text-sm text-muted-foreground">الصفحة غير موجودة</p>
        <Link to="/" className="mt-6 inline-flex rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground">الرئيسية</Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  console.error(error);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4" dir="rtl">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">حدث خطأ</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button onClick={() => { router.invalidate(); reset(); }}
          className="mt-6 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground">إعادة المحاولة</button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "Tissint — تطبيق النيازك" },
      { name: "description", content: "تطبيق Tissint لتحديد النيازك بالذكاء الاصطناعي وعرضها في السوق." },
      { name: "theme-color", content: "#123F5A" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;900&family=Noto+Sans+Arabic:wght@400;600;800&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <OfflineCacheBridge />
        <div className="min-h-screen w-full bg-stone flex items-center justify-center"
          style={{ background: "radial-gradient(circle at 30% 20%, oklch(0.28 0.04 250), oklch(0.15 0.02 250))" }}>
          <DeviceFrame>
            <OfflineBanner />
            <Outlet />
          </DeviceFrame>
          <DevPanel />
        </div>
        <Toaster position="top-center" richColors />
      </AppProvider>
    </QueryClientProvider>
  );
}

function OfflineCacheBridge() {
  useOfflineCache();
  return null;
}
