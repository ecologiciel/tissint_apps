import { createFileRoute } from "@tanstack/react-router";
import { LegalShell, LegalSection } from "@/components/tissint/legal-shell";

export const Route = createFileRoute("/legal/privacy")({ component: PrivacyPage });

function PrivacyPage() {
  return (
    <LegalShell title="سياسة الخصوصية" updatedAt="1 يناير 2026">
      <LegalSection title="البيانات التي نجمعها">
        الاسم، البريد، رقم الهاتف، الصور التي ترفعها، بيانات الموقع الجغرافي (إذا فعّلتها)، وتاريخ الاستخدام.
      </LegalSection>
      <LegalSection title="كيف نستخدمها">
        لتشغيل خدمات الفحص، إدارة السوق، الإشعارات، الفوترة، وتحسين دقة نموذج الذكاء الاصطناعي.
      </LegalSection>
      <LegalSection title="المشاركة مع الغير">
        لا نبيع بياناتك. نتعاون فقط مع: مزودي الدفع (CMI)، خدمات الاستضافة، وعند طلب قضائي قانوني.
      </LegalSection>
      <LegalSection title="حقوقك (CNDP)">
        لك الحق في الوصول، التصحيح، الحذف، النقل، والاعتراض. تواصل: privacy@tissint.ma.
      </LegalSection>
      <LegalSection title="مدة الحفظ">
        بيانات الحساب: طول مدة الاشتراك + 3 سنوات. الفواتير: 10 سنوات (إلزامي قانونياً).
      </LegalSection>
      <LegalSection title="الأمان">
        تشفير TLS 1.3 أثناء النقل، AES-256 عند التخزين، ومصادقة ثنائية اختيارية لجميع الحسابات.
      </LegalSection>
    </LegalShell>
  );
}
