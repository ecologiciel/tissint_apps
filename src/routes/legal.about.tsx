import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalShell, LegalSection } from "@/components/tissint/legal-shell";
import { Mail, MapPin, Globe } from "lucide-react";

export const Route = createFileRoute("/legal/about")({ component: AboutPage });

function AboutPage() {
  return (
    <LegalShell title="عن Tissint" updatedAt="1 يناير 2026">
      <LegalSection title="مهمتنا">
        Tissint هو أول تطبيق مغربي للتعرف على النيازك بالذكاء الاصطناعي وربط جامعي الأحجار النادرة بسوق موثوق.
        نحوّل خبرة سنوات من البحث الميداني في الصحراء إلى تجربة بسيطة في جيبك.
      </LegalSection>
      <LegalSection title="القصة">
        وُلد Tissint من سقوط نيزك تيسنت الشهير سنة 2011 جنوب المغرب. منذ ذلك الحين، شغفنا هو حماية هذا التراث الكوني
        وجعله متاحاً للعالم.
      </LegalSection>
      <LegalSection title="الفريق">
        مهندسون، باحثون في علم النيازك، ومصممون من المغرب وفرنسا. أكثر من 20 ألف عينة دُرّب عليها النموذج.
      </LegalSection>
      <LegalSection title="تواصل معنا">
        <div className="space-y-2 text-sm">
          <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-orange" /> hello@tissint.ma</p>
          <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-orange" /> الرباط، المغرب</p>
          <p className="flex items-center gap-2"><Globe className="h-4 w-4 text-orange" /> tissint.ma</p>
        </div>
      </LegalSection>
      <div className="pt-2 flex gap-2">
        <Link to="/help" className="flex-1 rounded-xl bg-orange py-2.5 text-center text-xs font-bold text-white">مركز المساعدة</Link>
        <Link to="/legal/terms" className="flex-1 rounded-xl bg-muted py-2.5 text-center text-xs font-bold">الشروط</Link>
      </div>
    </LegalShell>
  );
}
