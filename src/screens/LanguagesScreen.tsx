import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CollapsedList, NamePill } from "@/components/game/CollapsedList";
import { ScreenFrame } from "@/components/game/ScreenFrame";
import { SpeakButton } from "@/components/game/SpeakButton";
import { TopBar } from "@/components/game/TopBar";
import { PHRASE_STATS } from "@/lib/game/cards";
import { CEFR_LEVELS, SUPPORTED_LANGUAGES, VOICE_SAMPLES } from "@/lib/game/constants";
import { t } from "@/lib/game/i18n";
import { sound } from "@/lib/game/sound";
import { useGame } from "@/lib/game/store";
import type { CEFRLevel, Language } from "@/lib/game/types";
import { cn } from "@/lib/utils";

export function LanguagesScreen() {
  const settings = useGame((s) => s.settings);
  const patch = useGame((s) => s.patchSettings);
  const setScreen = useGame((s) => s.setScreen);
  const openHelp = useGame((s) => s.openHelp);
  const lang = settings.language;
  const loc = lang === "fa" ? "fa" : lang === "nl" ? "nl" : "en";
  const [open, setOpen] = useState<"native" | "target" | "cefr" | null>(null);

  const togglePanel = (id: "native" | "target" | "cefr") => {
    sound.playClick();
    setOpen((cur) => (cur === id ? null : id));
  };

  const toggleTarget = (code: Language) => {
    sound.playClick();
    const has = settings.targetLanguages.includes(code);
    let next = has
      ? settings.targetLanguages.filter((c) => c !== code)
      : [...settings.targetLanguages, code];
    if (next.length > 4) next = next.slice(-4);
    if (next.length === 0) return;
    patch({ targetLanguages: next });
  };

  const nativeName = SUPPORTED_LANGUAGES.find((l) => l.code === settings.nativeLanguage)?.nativeName || settings.nativeLanguage;
  const targetSummary = settings.targetLanguages
    .map((c) => SUPPORTED_LANGUAGES.find((l) => l.code === c)?.nativeName || c)
    .join(" · ");
  const cefr = CEFR_LEVELS.find((l) => l.id === settings.cefrLevel);

  return (
    <ScreenFrame
      header={
        <TopBar
          lang={lang}
          title={t(lang, "languageSelectTitle")}
          step={1}
          onBack={() => setScreen("welcome")}
          onHelp={openHelp}
        />
      }
      footer={
        <Button
          size="lg"
          className="w-full"
          disabled={settings.targetLanguages.length === 0}
          onClick={() => {
            sound.playClick();
            setScreen("topics");
          }}
        >
          {t(lang, "nextStep")}
        </Button>
      }
    >
      <div className="space-y-2 py-3">
        <CollapsedList
          label={t(lang, "iSpeak")}
          summary={nativeName}
          open={open === "native"}
          onToggle={() => togglePanel("native")}
        >
          <div className="flex flex-wrap gap-1.5">
            {SUPPORTED_LANGUAGES.map((l) => {
              const active = settings.nativeLanguage === l.code;
              return (
                <div key={l.code} className="flex items-center gap-0.5">
                  <NamePill
                    label={l.nativeName}
                    active={active}
                    onClick={() => {
                      sound.playClick();
                      patch({ nativeLanguage: l.code });
                      setOpen(null);
                    }}
                  />
                  <SpeakButton
                    text={VOICE_SAMPLES[l.code]}
                    lang={l.code}
                    label={t(lang, "hearPhrase")}
                    size="sm"
                    className="text-muted"
                  />
                </div>
              );
            })}
          </div>
        </CollapsedList>

        <CollapsedList
          label={t(lang, "iLearn")}
          summary={targetSummary}
          open={open === "target"}
          onToggle={() => togglePanel("target")}
        >
          <p className="mb-2 text-xs text-subtle">{t(lang, "targetLanguagesHint")}</p>
          <div className="flex flex-wrap gap-1.5">
            {SUPPORTED_LANGUAGES.map((l) => {
              const active = settings.targetLanguages.includes(l.code);
              return (
                <NamePill
                  key={l.code}
                  label={l.nativeName}
                  active={active}
                  onClick={() => toggleTarget(l.code)}
                />
              );
            })}
          </div>
        </CollapsedList>

        <CollapsedList
          label={t(lang, "cefrLevelTitle")}
          summary={cefr ? cefr.label[loc] : settings.cefrLevel}
          open={open === "cefr"}
          onToggle={() => togglePanel("cefr")}
        >
          <div className="space-y-1.5">
            {CEFR_LEVELS.map((lv) => {
              const active = settings.cefrLevel === lv.id;
              return (
                <button
                  key={lv.id}
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    patch({ cefrLevel: lv.id as CEFRLevel });
                    setOpen(null);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl px-3 py-2 text-start",
                    active ? "bg-paper text-paper-ink" : "bg-bg-subtle text-fg",
                  )}
                >
                  <span className="text-sm font-semibold">{lv.label[loc]}</span>
                  {lv.id !== "B2" && lv.id !== "C1" && (
                    <span className="text-[10px] tabular-nums text-muted">
                      {lv.id === "all" ? PHRASE_STATS.total : PHRASE_STATS[lv.id as "A1" | "A2" | "B1"] || ""}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </CollapsedList>
      </div>
    </ScreenFrame>
  );
}
