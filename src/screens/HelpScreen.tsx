import { Button } from "@/components/ui/button";
import { ScreenFrame } from "@/components/game/ScreenFrame";
import { TopBar } from "@/components/game/TopBar";
import { helpSections, t } from "@/lib/game/i18n";
import { sound } from "@/lib/game/sound";
import { useGame } from "@/lib/game/store";

export function HelpScreen() {
  const settings = useGame((s) => s.settings);
  const close = useGame((s) => s.closeHelp);
  const lang = settings.language;
  const sections = helpSections(lang);

  return (
    <ScreenFrame
      header={<TopBar lang={lang} title={t(lang, "guide")} onBack={close} />}
      footer={
        <Button
          className="w-full"
          onClick={() => {
            sound.playClick();
            close();
          }}
        >
          {t(lang, "close")}
        </Button>
      }
    >
      <div className="space-y-3 py-3">
        {sections.map((s) => (
          <article key={s.id} className="rounded-2xl bg-bg-elevated p-4">
            <h2 className="mb-1.5 text-sm font-semibold">{s.title}</h2>
            <p className="text-sm leading-relaxed text-muted">{s.body}</p>
          </article>
        ))}
      </div>
    </ScreenFrame>
  );
}
