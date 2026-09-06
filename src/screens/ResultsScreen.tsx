import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ScreenFrame } from "@/components/game/ScreenFrame";
import { SpeakButton } from "@/components/game/SpeakButton";
import { TEAM_COLORS } from "@/lib/game/constants";
import { t, tCat, tTeam } from "@/lib/game/i18n";
import { sound } from "@/lib/game/sound";
import { useGame } from "@/lib/game/store";
import { cn } from "@/lib/utils";

export function ResultsScreen() {
  const settings = useGame((s) => s.settings);
  const teams = useGame((s) => s.teams);
  const players = useGame((s) => s.players);
  const playedCards = useGame((s) => s.playedCards);
  const playAgain = useGame((s) => s.playAgain);
  const exitToWelcome = useGame((s) => s.exitToWelcome);
  const lang = settings.language;
  const [tab, setTab] = useState<"podium" | "learn">("podium");

  const ranked = [...teams].sort((a, b) => b.score - a.score);
  const winner = ranked[0];
  const tie = ranked.length > 1 && ranked[0].score === ranked[1].score && ranked[0].score > 0;
  const correct = playedCards.filter((c) => c.guessedCorrectly).length;
  const accuracy = playedCards.length ? Math.round((correct / playedCards.length) * 100) : 0;
  const missed = playedCards.filter((c) => !c.guessedCorrectly);

  const byTopic = useMemo(() => {
    const map: Record<string, { total: number; ok: number }> = {};
    playedCards.forEach((c) => {
      const k = c.card.topic;
      if (!map[k]) map[k] = { total: 0, ok: 0 };
      map[k].total += 1;
      if (c.guessedCorrectly) map[k].ok += 1;
    });
    return Object.entries(map).sort((a, b) => b[1].total - a[1].total);
  }, [playedCards]);

  return (
    <ScreenFrame
      header={
        <div className="grid grid-cols-2 gap-1 rounded-2xl bg-bg-elevated p-1">
          {(["podium", "learn"] as const).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={cn("h-10 rounded-xl text-sm font-medium", tab === id ? "bg-paper text-paper-ink" : "text-muted")}
            >
              {id === "podium" ? t(lang, "winner") : t(lang, "learningSummaryTitle")}
            </button>
          ))}
        </div>
      }
      footer={
        <div className="grid grid-cols-2 gap-2">
          <Button variant="ghost" onClick={exitToWelcome}>
            {t(lang, "home")}
          </Button>
          <Button
            onClick={() => {
              sound.playClick();
              playAgain();
            }}
          >
            {t(lang, "playAgain")}
          </Button>
        </div>
      }
    >
      <div className="py-3">
        {tab === "podium" ? (
          <div className="space-y-4">
            <div className="rounded-[28px] bg-bg-elevated p-5 text-center">
              <p className="text-xs uppercase tracking-wider text-muted">{tie ? t(lang, "tie") : t(lang, "winner")}</p>
              {winner ? (
                <>
                  <p className="mt-2 font-display text-3xl" style={{ color: TEAM_COLORS[winner.color].hex }}>
                    {tTeam(lang, winner.color)}
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    {players
                      .filter((p) => p.teamId === winner.id)
                      .map((p) => p.name)
                      .join(" · ")}
                  </p>
                </>
              ) : null}
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <Stat label={t(lang, "totalScore")} value={String(teams.reduce((s, tm) => s + tm.score, 0))} />
                <Stat label={t(lang, "accuracyLabel")} value={`${accuracy}%`} />
                <Stat label={t(lang, "cardsReviewed")} value={String(playedCards.length)} />
              </div>
            </div>
            <ul className="space-y-2">
              {ranked.map((tm, i) => {
                const c = TEAM_COLORS[tm.color];
                return (
                  <li key={tm.id} className="flex items-center gap-3 rounded-2xl bg-bg-elevated px-4 py-3">
                    <span className="w-4 text-xs text-muted">{i + 1}</span>
                    <span className="size-2.5 rounded-full" style={{ background: c.hex }} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{tTeam(lang, tm.color)}</p>
                      <p className="truncate text-[11px] text-muted">
                        {players
                          .filter((p) => p.teamId === tm.id)
                          .map((p) => p.name)
                          .join(" · ")}
                      </p>
                    </div>
                    <span className="tabular text-sm font-semibold">{tm.score}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              {byTopic.map(([id, stat]) => (
                <div key={id}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span>{tCat(lang, id)}</span>
                    <span className="text-muted">
                      {stat.ok}/{stat.total}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-bg-subtle">
                    <div
                      className="h-full rounded-full bg-teal"
                      style={{ width: `${stat.total ? (stat.ok / stat.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            {missed.length ? (
              <div>
                <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted">{t(lang, "missedCardsTitle")}</h3>
                <ul className="space-y-2">
                  {missed.slice(0, 12).map((c, i) => (
                    <li key={`${c.card.id}-${i}`} className="rounded-2xl bg-bg-elevated px-3 py-2.5">
                      <div className="flex items-start gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1">
                            <p dir="ltr" className="text-sm font-medium">
                              {c.card.targetText}
                            </p>
                            <SpeakButton
                              text={c.card.targetText}
                              lang={c.card.targetLanguage}
                              label={t(lang, "hearTarget")}
                              size="sm"
                              className="text-muted hover:text-fg"
                            />
                          </div>
                          <div className="flex items-center gap-1">
                            <p className="text-xs text-muted">{c.card.translation}</p>
                            <SpeakButton
                              text={c.card.translation}
                              lang={c.card.nativeLanguage || lang}
                              label={t(lang, "hearNative")}
                              size="sm"
                              className="text-muted hover:text-fg"
                            />
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </ScreenFrame>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="tabular text-lg font-semibold">{value}</p>
      <p className="text-[10px] text-muted">{label}</p>
    </div>
  );
}
