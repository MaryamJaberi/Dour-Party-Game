import { ScreenFrame } from "@/components/game/ScreenFrame";
import { TopBar } from "@/components/game/TopBar";
import { TEAM_COLORS } from "@/lib/game/constants";
import { t, tTeam } from "@/lib/game/i18n";
import { useGame } from "@/lib/game/store";
import { TeamColor } from "@/lib/game/types";

export function HistoryScreen() {
  const settings = useGame((s) => s.settings);
  const history = useGame((s) => s.history);
  const setScreen = useGame((s) => s.setScreen);
  const lang = settings.language;

  return (
    <ScreenFrame
      header={<TopBar lang={lang} title={t(lang, "history")} onBack={() => setScreen("welcome")} />}
    >
      <div>
        {history.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted">{t(lang, "emptyHistory")}</p>
        ) : (
          <ul className="space-y-2 pb-2">
            {history.map((h) => {
              const color = h.winnerColor === "TIE" ? null : TEAM_COLORS[h.winnerColor as TeamColor];
              const date = new Date(h.date);
              const label = Number.isNaN(date.getTime())
                ? h.date
                : date.toLocaleDateString(lang === "fa" ? "fa-IR" : lang);
              return (
                <li key={h.id} className="rounded-2xl bg-bg-elevated px-4 py-3">
                  <div className="flex items-center gap-2">
                    {color ? <span className="size-2.5 rounded-full" style={{ background: color.hex }} /> : null}
                    <span className="text-sm font-semibold">
                      {h.winnerColor === "TIE" ? t(lang, "tie") : tTeam(lang, String(h.winnerColor))}
                    </span>
                    <span className="ms-auto text-[11px] text-muted">{label}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted">{h.winnerNames.join(" · ")}</p>
                  <p className="mt-1 text-[11px] text-subtle">
                    {h.playedCardsCount ?? 0} · {h.accuracy ?? 0}% · {(h.targetLanguages || []).join(", ")}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </ScreenFrame>
  );
}
