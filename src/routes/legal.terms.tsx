import { createFileRoute } from "@tanstack/react-router";
import { LegalShell, LegalSection } from "@/components/tissint/legal-shell";

export const Route = createFileRoute("/legal/terms")({ component: TermsPage });

function TermsPage() {
  return (
    <LegalShell title="شروط الاستخدام" updatedAt="1 يناير 2026">
      <LegalSection title="1. القبول">
        باستخدامك لتطبيق Tissint فإنك توافق على هذه الشروط. إذا كنت لا توافق، يُرجى التوقف عن استخدام التطبيق.
      </LegalSection>
      <LegalSection title="2. الحساب">
        يجب أن يكون عمرك 18 سنة فأكثر. أنت مسؤول عن سرية كلمة المرور وعن جميع الأنشطة التي تتم عبر حسابك.
      </LegalSection>
      <LegalSection title="3. الفحص بالذكاء الاصطناعي">
        نتائج التحليل تقديرية وقد لا تكون دقيقة 100%. تبقى مسؤوليتك التحقق العلمي قبل أي معاملة تجارية مهمة.
      </LegalSection>
      <LegalSection title="4. السوق">
        البائع مسؤول عن صحة المعلومات والصور. Tissint تأخذ عمولة 5% على كل صفقة وتحتفظ بحق رفض أي إعلان.
      </LegalSection>
      <LegalSection title="5. المدفوعات">
        المدفوعات تُعالج عبر CMI / Visa / المحفظة. الاشتراك Premium يُجدد تلقائياً ما لم يتم إلغاؤه قبل تاريخ التجديد.
      </LegalSection>
      <LegalSection title="6. المحتوى المحظور">
        يمنع نشر نيازك مزيفة، صور مسروقة، أو أي محتوى يخالف القانون المغربي.
      </LegalSection>
      <LegalSection title="7. الإنهاء">
        نحتفظ بحق تعليق أو إنهاء أي حساب يخالف هذه الشروط دون إشعار مسبق.
      </LegalSection>
      <LegalSection title="8. القانون المطبق">
        تخضع هذه الشروط للقانون المغربي. المحاكم المختصة هي محاكم الرباط.
      </LegalSection>
    </LegalShell>
  );
}
