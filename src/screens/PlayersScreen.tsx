import { Button } from "@/components/ui/button";
import { ScreenFrame } from "@/components/game/ScreenFrame";
import { TopBar } from "@/components/game/TopBar";
import { TEAM_COLORS, TEAM_ORDER } from "@/lib/game/constants";
import { getRandomCharacters } from "@/lib/game/characters";
import { t, tTeam } from "@/lib/game/i18n";
import { sound } from "@/lib/game/sound";
import { useGame } from "@/lib/game/store";

export function PlayersScreen() {
  const settings = useGame((s) => s.settings);
  const patch = useGame((s) => s.patchSettings);
  const setScreen = useGame((s) => s.setScreen);
  const prepare = useGame((s) => s.prepareSeating);
  const openHelp = useGame((s) => s.openHelp);
  const lang = settings.language;
  const teamCount = settings.playerCount / 2;

  const setName = (i: number, name: string) => {
    const names = [...settings.playerNames];
    names[i] = name;
    patch({ playerNames: names });
  };

  return (
    <ScreenFrame
      header={
        <TopBar
          lang={lang}
          title={t(lang, "playerNames")}
          step={4}
          onBack={() => setScreen("setup")}
          onHelp={openHelp}
        />
      }
      footer={
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="ghost"
            onClick={() => {
              sound.playClick();
              patch({ playerNames: getRandomCharacters(settings.nativeLanguage, 8) });
            }}
          >
            {t(lang, "randomize")}
          </Button>
          <Button
            onClick={() => {
              sound.playClick();
              prepare();
            }}
          >
            {t(lang, "start")}
          </Button>
        </div>
      }
    >
      <p className="py-2 text-xs text-muted">{t(lang, "namesHint")}</p>
      <div className="space-y-2 pb-2">
        {Array.from({ length: settings.playerCount }, (_, i) => {
          const teamId = i % teamCount;
          const color = TEAM_COLORS[TEAM_ORDER[teamId]];
          return (
            <label key={i} className="flex items-center gap-2 rounded-2xl bg-bg-elevated px-3 py-2">
              <span
                className="flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                style={{ background: color.hex, color: color.ink }}
              >
                {i + 1}
              </span>
              <input
                value={settings.playerNames[i] || ""}
                onChange={(e) => setName(i, e.target.value)}
                className="h-10 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-subtle"
                placeholder={`${t(lang, "players")} ${i + 1}`}
              />
              <span className="text-[11px] text-muted">{tTeam(lang, TEAM_ORDER[teamId])}</span>
            </label>
          );
        })}
      </div>
    </ScreenFrame>
  );
}
