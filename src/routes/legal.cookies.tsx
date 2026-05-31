import { createFileRoute } from "@tanstack/react-router";
import { LegalShell, LegalSection } from "@/components/tissint/legal-shell";

export const Route = createFileRoute("/legal/cookies")({ component: CookiesPage });

function CookiesPage() {
  return (
    <LegalShell title="سياسة ملفات تعريف الارتباط" updatedAt="1 يناير 2026">
      <LegalSection title="ما هي ملفات تعريف الارتباط؟">
        ملفات صغيرة تُخزَّن على جهازك لحفظ تفضيلاتك وتحسين تجربة الاستخدام.
      </LegalSection>
      <LegalSection title="الأنواع التي نستعملها">
        <ul className="list-disc pr-5 space-y-1">
          <li>
            <b>ضرورية:</b> الجلسة، المصادقة، الأمان (لا يمكن تعطيلها).
          </li>
          <li>
            <b>وظيفية:</b> اللغة، السمة الداكنة، حالة المحفظة.
          </li>
          <li>
            <b>تحليلية:</b> إحصائيات مجهولة لتحسين الخدمة.
          </li>
          <li>
            <b>تسويقية:</b> اقتراحات Premium مخصصة (اختياري).
          </li>
        </ul>
      </LegalSection>
      <LegalSection title="إدارة ملفاتك">
        يمكنك في أي وقت تغيير تفضيلاتك من الإعدادات أو حذف الملفات من إعدادات المتصفح.
      </LegalSection>
    </LegalShell>
  );
}
