import { ArrowLeft, ArrowRight, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/game/i18n";
import { sound } from "@/lib/game/sound";
import type { Language } from "@/lib/game/types";
import { isRtl } from "@/lib/utils";

export function TopBar({
  lang,
  title,
  step,
  total = 4,
  onBack,
  onHelp,
}: {
  lang: Language;
  title: string;
  step?: number;
  total?: number;
  onBack?: () => void;
  onHelp?: () => void;
}) {
  const rtl = isRtl(lang);
  const BackIcon = rtl ? ArrowRight : ArrowLeft;
  return (
    <header className="flex items-center gap-1.5 py-0.5 shrink-0">
      {onBack ? (
        <Button variant="ghost" size="icon" onClick={() => { sound.playClick(); onBack(); }} aria-label={t(lang, "back")} className="size-10">
          <BackIcon className="size-4" />
        </Button>
      ) : (
        <div className="size-10" />
      )}
      <div className="min-w-0 flex-1 text-center">
        <h1 className="truncate text-sm font-semibold tracking-tight">{title}</h1>
        {step ? (
          <p className="text-[11px] text-muted">{t(lang, "stepOf", { n: step, total })}</p>
        ) : null}
      </div>
      {onHelp ? (
        <Button variant="ghost" size="icon" onClick={() => { sound.playClick(); onHelp(); }} aria-label={t(lang, "guide")} className="size-10">
          <HelpCircle className="size-4" />
        </Button>
      ) : (
        <div className="size-10" />
      )}
    </header>
  );
}
