import { Button } from "@/components/ui/button";
import { ScreenFrame } from "@/components/game/ScreenFrame";
import { TopBar } from "@/components/game/TopBar";
import { t } from "@/lib/game/i18n";
import { sound } from "@/lib/game/sound";
import { useGame } from "@/lib/game/store";
import type { CardGameMode } from "@/lib/game/types";
import { cn } from "@/lib/utils";

function Segment<T extends string | number>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="grid gap-1 rounded-2xl bg-bg-elevated p-1" style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}>
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          onClick={() => {
            sound.playClick();
            onChange(o.value);
          }}
          className={cn(
            "h-10 rounded-xl text-sm font-medium",
            value === o.value ? "bg-paper text-paper-ink" : "text-muted hover:text-fg",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        sound.playClick();
        onChange(!checked);
      }}
      className="flex w-full items-center justify-between rounded-2xl bg-bg-elevated px-4 py-3 text-start"
    >
      <span className="text-sm">{label}</span>
      <span dir="ltr" className={cn("h-6 w-10 rounded-full p-0.5 transition-colors", checked ? "bg-teal" : "bg-bg-subtle")}>
        <span className={cn("block size-5 rounded-full bg-paper transition-transform", checked ? "translate-x-4" : "translate-x-0")} />
      </span>
    </button>
  );
}

export function SetupScreen() {
  const settings = useGame((s) => s.settings);
  const patch = useGame((s) => s.patchSettings);
  const setScreen = useGame((s) => s.setScreen);
  const openHelp = useGame((s) => s.openHelp);
  const lang = settings.language;

  return (
    <ScreenFrame
      header={
        <TopBar
          lang={lang}
          title={t(lang, "setup")}
          step={3}
          onBack={() => setScreen("topics")}
          onHelp={openHelp}
        />
      }
      footer={
        <Button
          size="lg"
          className="w-full"
          onClick={() => {
            sound.playClick();
            setScreen("players");
          }}
        >
          {t(lang, "nextStep")}
        </Button>
      }
    >
      <div className="space-y-5 py-3">
        <section>
          <h2 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted">{t(lang, "playersCount")}</h2>
          <Segment
            value={settings.playerCount}
            options={[
              { value: 4 as const, label: "4" },
              { value: 6 as const, label: "6" },
              { value: 8 as const, label: "8" },
            ]}
            onChange={(v) => patch({ playerCount: v })}
          />
        </section>

        <section>
          <h2 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted">{t(lang, "matchLength")}</h2>
          <Segment
            value={settings.roundsCount}
            options={[
              { value: 2, label: "2" },
              { value: 3, label: "3" },
              { value: 5, label: "5" },
            ]}
            onChange={(v) => patch({ roundsCount: v })}
          />
          <p className="mt-2 mb-1 text-[11px] text-subtle">{t(lang, "duration")}</p>
          <Segment
            value={settings.roundDuration}
            options={[
              { value: 45, label: "45s" },
              { value: 60, label: "60s" },
              { value: 90, label: "90s" },
            ]}
            onChange={(v) => patch({ roundDuration: v })}
          />
        </section>

        <section>
          <h2 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted">{t(lang, "cardMode")}</h2>
          <Segment
            value={settings.cardGameMode}
            options={[
              { value: "mixed" as CardGameMode, label: t(lang, "modeMixed") },
              { value: "standard" as CardGameMode, label: t(lang, "modeStandard") },
              { value: "reverse" as CardGameMode, label: t(lang, "modeReverse") },
            ]}
            onChange={(v) => patch({ cardGameMode: v })}
          />
        </section>

        <section className="space-y-2">
          <Toggle
            label={t(lang, "hideCard")}
            checked={settings.passPhoneScreenEnabled}
            onChange={(v) => patch({ passPhoneScreenEnabled: v })}
          />
          <Toggle
            label={t(lang, "powerCards")}
            checked={settings.powerCardsEnabled}
            onChange={(v) => patch({ powerCardsEnabled: v })}
          />
          <Toggle
            label={t(lang, "pronounce")}
            checked={settings.autoPronounceOnCorrect}
            onChange={(v) => patch({ autoPronounceOnCorrect: v })}
          />
        </section>
      </div>
    </ScreenFrame>
  );
}
