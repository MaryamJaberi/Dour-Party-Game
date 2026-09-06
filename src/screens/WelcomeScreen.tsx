import { useState } from "react";
import { BookOpen, History, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CollapsedList, NamePill } from "@/components/game/CollapsedList";
import { ScreenFrame } from "@/components/game/ScreenFrame";
import { UI_LANGUAGES, langInfo } from "@/lib/game/constants";
import { t } from "@/lib/game/i18n";
import { sound } from "@/lib/game/sound";
import { useGame } from "@/lib/game/store";

export function WelcomeScreen() {
  const settings = useGame((s) => s.settings);
  const patch = useGame((s) => s.patchSettings);
  const setScreen = useGame((s) => s.setScreen);
  const openHelp = useGame((s) => s.openHelp);
  const lang = settings.language;
  const [openLangs, setOpenLangs] = useState(false);

  return (
    <ScreenFrame
      header={
        <div className="flex justify-end">
          <button
            type="button"
            className="flex size-10 items-center justify-center rounded-xl text-muted hover:text-fg hover:bg-fg/8"
            onClick={() => {
              sound.playClick();
              patch({ soundEnabled: !settings.soundEnabled });
            }}
            aria-label={settings.soundEnabled ? t(lang, "soundOn") : t(lang, "soundOff")}
          >
            {settings.soundEnabled ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
          </button>
        </div>
      }
      footer={
        <div className="space-y-2">
          <Button
            size="lg"
            className="w-full"
            onClick={() => {
              sound.playStartGame();
              setScreen("languages");
            }}
          >
            {t(lang, "startGame")}
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="ghost"
              onClick={() => {
                sound.playClick();
                openHelp();
              }}
            >
              <BookOpen className="size-4" />
              {t(lang, "howToPlay")}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                sound.playClick();
                setScreen("history");
              }}
            >
              <History className="size-4" />
              {t(lang, "matches")}
            </Button>
          </div>
        </div>
      }
    >
      <div className="relative flex min-h-[42%] flex-col items-center justify-center py-6 text-center">
        <div className="party-chip mb-3 flex gap-2">
          <span className="size-3 rounded-full bg-accent shadow-[0_0_12px_#ff4d7a]" />
          <span className="size-3 rounded-full bg-warn shadow-[0_0_12px_#ffc857]" />
          <span className="size-3 rounded-full bg-teal shadow-[0_0_12px_#2ee0b2]" />
        </div>
        <h1 className="logo-glow font-display text-7xl font-semibold leading-none text-fg">دور</h1>
        <p className="mt-2 font-display text-lg font-semibold tracking-[0.28em] text-warn">PARTY</p>
        <p className="mt-4 max-w-[17rem] text-sm text-muted">{t(lang, "tagline")}</p>
      </div>

      <CollapsedList
        label={t(lang, "uiLanguage")}
        summary={langInfo(lang).nativeName}
        open={openLangs}
        onToggle={() => {
          sound.playClick();
          setOpenLangs((v) => !v);
        }}
      >
        <div className="flex flex-wrap gap-1.5">
          {UI_LANGUAGES.map((code) => {
            const info = langInfo(code);
            return (
              <NamePill
                key={code}
                label={info.nativeName}
                active={lang === code}
                onClick={() => {
                  sound.playClick();
                  patch({ language: code });
                  setOpenLangs(false);
                }}
              />
            );
          })}
        </div>
      </CollapsedList>
    </ScreenFrame>
  );
}
