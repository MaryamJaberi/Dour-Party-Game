import { Button } from "@/components/ui/button";
import { PlayerTable } from "@/components/game/PlayerTable";
import { ScreenFrame } from "@/components/game/ScreenFrame";
import { TopBar } from "@/components/game/TopBar";
import { TEAM_COLORS } from "@/lib/game/constants";
import { t, tTeam } from "@/lib/game/i18n";
import { sound } from "@/lib/game/sound";
import { useGame } from "@/lib/game/store";

export function SeatingScreen() {
  const settings = useGame((s) => s.settings);
  const teams = useGame((s) => s.teams);
  const players = useGame((s) => s.players);
  const setScreen = useGame((s) => s.setScreen);
  const confirm = useGame((s) => s.confirmSeating);
  const lang = settings.language;

  return (
    <ScreenFrame
      header={
        <TopBar lang={lang} title={t(lang, "confirmTable")} onBack={() => setScreen("players")} />
      }
      footer={
        <Button
          size="lg"
          className="w-full shadow-[0_10px_28px_-12px_rgba(226,75,90,0.8)]"
          onClick={() => {
            sound.playClick();
            confirm();
          }}
        >
          {t(lang, "imReady")}
        </Button>
      }
    >
      <p className="px-2 pb-1 pt-1 text-center text-[12px] leading-snug text-muted">{t(lang, "seatingHint")}</p>

      <div className="flex justify-center py-2">
        <PlayerTable players={players} teams={teams} activeIndex={0} />
      </div>

      <ul className="mt-1 space-y-2 px-0.5 pb-2">
        {teams.map((team) => {
          const names = players.filter((p) => p.teamId === team.id).map((p) => p.name);
          const color = TEAM_COLORS[team.color];
          return (
            <li
              key={team.id}
              className="flex items-center gap-3 rounded-2xl px-3 py-2.5"
              style={{ background: color.soft, boxShadow: `inset 3px 0 0 ${color.hex}` }}
            >
              <span className="size-2.5 shrink-0 rounded-full" style={{ background: color.hex }} />
              <span className="text-sm font-semibold">{tTeam(lang, team.color)}</span>
              <span className="ms-auto text-sm text-muted">{names.join(" · ")}</span>
            </li>
          );
        })}
      </ul>
    </ScreenFrame>
  );
}
