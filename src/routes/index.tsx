import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tissint — تطبيق النيازك المغربية" },
      { name: "description", content: "حدد النيازك بالذكاء الاصطناعي، احفظ مجموعتك، وانشر إعلاناتك في السوق." },
    ],
  }),
  component: Index,
});

function Index() {
  const { onboarded } = useApp();
  return <Navigate to={onboarded ? "/dashboard" : "/onboarding"} replace />;
}
