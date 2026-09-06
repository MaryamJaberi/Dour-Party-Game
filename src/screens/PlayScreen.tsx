import { useEffect, useRef } from "react";
import {
  Check,
  Clock3,
  HelpCircle,
  Lightbulb,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Overlay } from "@/components/game/Overlay";
import { TurnStrip } from "@/components/game/PlayerTable";
import { SpeakButton } from "@/components/game/SpeakButton";
import { langInfo, TEAM_COLORS } from "@/lib/game/constants";
import { t, tCat, tTeam } from "@/lib/game/i18n";
import { sound } from "@/lib/game/sound";
import { useGame } from "@/lib/game/store";
import { formatMs } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function GameClock() {
  const tick = useGame((s) => s.tick);
  const tickUndo = useGame((s) => s.tickUndo);
  const overlay = useGame((s) => s.overlay);
  const screen = useGame((s) => s.screen);
  const roundTimer = useGame((s) => s.roundTimer);
  const undo = useGame((s) => s.undo);
  const lastSecond = useRef(-1);

  useEffect(() => {
    if (screen !== "play" || overlay !== "none") return;
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const delta = Math.min(400, now - last);
      last = now;
      tick(delta);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [tick, overlay, screen]);

  useEffect(() => {
    if (!undo) return;
    const id = window.setInterval(() => tickUndo(), 1000);
    return () => clearInterval(id);
  }, [undo, tickUndo]);

  useEffect(() => {
    if (screen !== "play" || overlay !== "none") return;
    const sec = Math.ceil(roundTimer / 1000);
    if (sec <= 5 && sec > 0 && sec !== lastSecond.current) {
      lastSecond.current = sec;
      sound.playCountdownBeep(sec);
    }
    if (sec > 5) lastSecond.current = -1;
  }, [roundTimer, overlay, screen]);

  return null;
}

export function PlayScreen() {
  const settings = useGame((s) => s.settings);
  const overlay = useGame((s) => s.overlay);
  const teams = useGame((s) => s.teams);
  const players = useGame((s) => s.players);
  const currentRound = useGame((s) => s.currentRound);
  const activePlayerIndex = useGame((s) => s.activePlayerIndex);
  const roundTimer = useGame((s) => s.roundTimer);
  const currentCard = useGame((s) => s.currentCard);
  const swapCooldown = useGame((s) => s.swapCooldown);
  const undo = useGame((s) => s.undo);
  const undoLeft = useGame((s) => s.undoLeft);
  const streak = useGame((s) => s.streak);
  const boostUsed = useGame((s) => s.boostUsed);
  const showHint = useGame((s) => s.showHint);
  const toast = useGame((s) => s.toast);
  const eliminatedColor = useGame((s) => s.eliminatedColor);
  const flashName = useGame((s) => s.flashName);

  const patch = useGame((s) => s.patchSettings);
  const correct = useGame((s) => s.correct);
  const skip = useGame((s) => s.skip);
  const swapCard = useGame((s) => s.swapCard);
  const useBoost = useGame((s) => s.useBoost);
  const undoLast = useGame((s) => s.undoLast);
  const pause = useGame((s) => s.pause);
  const resume = useGame((s) => s.resume);
  const revealTurn = useGame((s) => s.revealTurn);
  const continueAfterElimination = useGame((s) => s.continueAfterElimination);
  const nextRoundOrEnd = useGame((s) => s.nextRoundOrEnd);
  const exitToWelcome = useGame((s) => s.exitToWelcome);
  const openHelp = useGame((s) => s.openHelp);
  const setHint = useGame((s) => s.setHint);
  const setOverlayAlmost = () => useGame.setState({ overlay: "almost" });

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => useGame.setState({ toast: null }), 1400);
    return () => clearTimeout(id);
  }, [toast]);

  useEffect(() => {
    if (!flashName || overlay !== "none") return;
    const id = window.setTimeout(() => useGame.setState({ flashName: null }), 1100);
    return () => clearTimeout(id);
  }, [flashName, overlay]);

  const lang = settings.language;
  const player = players[activePlayerIndex];
  const team = teams.find((tm) => tm.id === player?.teamId);
  const partner = players.find((p) => p.teamId === player?.teamId && p.id !== player?.id);
  const color = player ? TEAM_COLORS[player.teamColor] : TEAM_COLORS.BLUE;
  const info = currentCard ? langInfo(currentCard.targetLanguage) : null;
  const reverse = Boolean(currentCard?.isReverse);
  const roundPct = Math.max(0, roundTimer / (settings.roundDuration * 1000));
  const lastRound = currentRound >= settings.roundsCount;

  return (
    <div className="relative flex h-full min-h-0 flex-col gap-2 overflow-hidden">
      <GameClock />

      <header className="flex items-center gap-2 shrink-0">
        <span className="rounded-full bg-bg-elevated px-3 py-1.5 text-xs tabular text-muted">
          {t(lang, "round")} {currentRound}/{settings.roundsCount}
        </span>
        {info ? (
          <span className="flex min-w-0 items-center gap-1.5 rounded-full bg-bg-elevated px-2.5 py-1.5 text-xs">
            <span className="truncate">{info.nativeName}</span>
            <span className="text-muted">{currentCard?.cefrLevel}</span>
          </span>
        ) : null}
        <div className="ms-auto flex items-center gap-1">
          <button
            type="button"
            className="flex size-10 items-center justify-center rounded-xl text-muted hover:bg-fg/8 hover:text-fg"
            onClick={() => {
              sound.playToggle();
              patch({ soundEnabled: !settings.soundEnabled });
            }}
            aria-label={settings.soundEnabled ? t(lang, "soundOn") : t(lang, "soundOff")}
          >
            {settings.soundEnabled ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
          </button>
          <button
            type="button"
            className="flex size-10 items-center justify-center rounded-xl text-muted hover:bg-fg/8 hover:text-fg"
            onClick={openHelp}
            aria-label={t(lang, "guide")}
          >
            <HelpCircle className="size-4" />
          </button>
          <button
            type="button"
            className="flex size-10 items-center justify-center rounded-xl text-muted hover:bg-fg/8 hover:text-fg"
            onClick={() => {
              sound.playClick();
              pause();
            }}
            aria-label={t(lang, "pause")}
          >
            <Pause className="size-4" />
          </button>
        </div>
      </header>

      <TurnStrip players={players} teams={teams} activeIndex={activePlayerIndex} />

      <div className="relative min-h-0 flex-1">
        <div className="paper-card flex h-full min-h-0 flex-col rounded-[24px] p-3.5 shadow-soft">
          <div className="flex items-center gap-2">
            <span
              className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
              style={{ background: color.hex, color: color.ink }}
            >
              {player?.name}
            </span>
            {streak >= 2 ? (
              <span className="text-[11px] font-semibold text-accent">
                {t(lang, "combo")} ×{streak}
              </span>
            ) : null}
            <span className="ms-auto rounded-full bg-paper-ink/8 px-2 py-1 text-[11px] font-medium text-paper-muted">
              {reverse ? t(lang, "reverseMode") : currentCard ? tCat(lang, currentCard.topic) : ""}
            </span>
          </div>

          <div className="flex min-h-0 flex-1 flex-col items-center justify-center py-3 text-center">
            {currentCard ? (
              reverse ? (
                <>
                  <p className="text-[11px] uppercase tracking-wider text-paper-muted">{t(lang, "sayThis")}</p>
                  <div className="mt-1 flex max-w-sm items-center justify-center gap-1">
                    <p className="font-display text-2xl leading-snug">{currentCard.translation}</p>
                    <SpeakButton
                      text={currentCard.translation}
                      lang={currentCard.nativeLanguage || lang}
                      label={t(lang, "hearNative")}
                      className="bg-paper-ink/8"
                    />
                  </div>
                  <p className="mt-3 text-[11px] text-paper-muted">{t(lang, "listenFor")}</p>
                  <div className="mt-0.5 flex items-center justify-center gap-1">
                    <p dir="ltr" className="text-base font-semibold">
                      {currentCard.targetText}
                    </p>
                    <SpeakButton
                      text={currentCard.targetText}
                      lang={currentCard.targetLanguage}
                      label={t(lang, "hearTarget")}
                      className="bg-paper-ink/8"
                    />
                  </div>
                </>
              ) : (
                <>
                  <p className="text-[11px] uppercase tracking-wider text-paper-muted">{t(lang, "sayThis")}</p>
                  <div className="mt-1 flex max-w-sm items-center justify-center gap-1">
                    <p dir="ltr" className="font-display text-2xl leading-snug">
                      {currentCard.targetText}
                    </p>
                    <SpeakButton
                      text={currentCard.targetText}
                      lang={currentCard.targetLanguage}
                      label={t(lang, "hearTarget")}
                      className="bg-paper-ink/8"
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-center gap-1">
                    <p className="text-sm text-paper-muted">{currentCard.translation}</p>
                    <SpeakButton
                      text={currentCard.translation}
                      lang={currentCard.nativeLanguage || lang}
                      label={t(lang, "hearNative")}
                      size="sm"
                      className="bg-paper-ink/8 text-paper-muted"
                    />
                  </div>
                </>
              )
            ) : (
              <p className="text-sm text-paper-muted">{t(lang, "exhausted")}</p>
            )}

            {currentCard?.hint ? (
              <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
                <button
                  type="button"
                  className={cn(
                    "flex h-8 items-center gap-1 rounded-full px-2.5 text-[11px] font-medium",
                    showHint ? "bg-paper-ink text-paper" : "bg-paper-ink/8",
                  )}
                  onClick={() => setHint(!showHint)}
                >
                  <Lightbulb className="size-3.5" />
                  {t(lang, "hint")}
                </button>
              </div>
            ) : null}

            {showHint && currentCard?.hint ? (
              <p className="mt-2 max-w-xs text-xs text-paper-muted">{currentCard.hint}</p>
            ) : null}
          </div>

          <div className="flex items-center justify-between text-[11px] text-paper-muted">
            <span>
              {t(lang, "partner")}: <strong className="text-paper-ink">{partner?.name}</strong>
            </span>
            <span className="tabular font-semibold text-paper-ink">
              +{(currentCard?.isGolden ? (currentCard.points || 1) * 2 : currentCard?.points) || 1} {t(lang, "points")}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-1.5 shrink-0">
        <div className="flex items-center justify-between text-[11px] text-muted">
          <span>
            {t(lang, "roundTimer")} <span className="tabular text-fg">{formatMs(roundTimer)}</span>
          </span>
          <span className={cn("tabular", roundTimer < 10000 ? "text-accent" : "")}>{Math.ceil(roundTimer / 1000)}s</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-bg-subtle">
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-150"
            style={{ width: `${roundPct * 100}%` }}
          />
        </div>
        <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${teams.length}, 1fr)` }}>
          {teams.map((tm) => {
            const c = TEAM_COLORS[tm.color];
            const pct = Math.max(0, tm.timeRemaining / (settings.roundDuration * 1000));
            return (
              <div key={tm.id} className="space-y-1">
                <div className="h-1 overflow-hidden rounded-full bg-bg-subtle">
                  <div className="h-full rounded-full" style={{ width: `${pct * 100}%`, background: c.hex }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {undo ? (
        <button
          type="button"
          onClick={undoLast}
          className="mx-auto flex h-9 items-center gap-1.5 rounded-full bg-paper px-3 text-xs font-medium text-paper-ink"
        >
          <RotateCcw className="size-3.5" />
          {t(lang, "undo")} {undoLeft}s
        </button>
      ) : null}

      {toast ? (
        <p className="text-center text-xs font-medium text-teal">
          {toast === "golden" ? t(lang, "golden") : toast === "speed" ? t(lang, "speed") : toast === "combo" ? t(lang, "combo") : t(lang, "timeBoost")}
        </p>
      ) : null}

      <div className="grid grid-cols-3 gap-2 shrink-0">
        <Button variant="ghost" data-testid="skip-btn" onClick={skip}>
          <X className="size-4" />
          {t(lang, "skip")}
        </Button>
        <Button variant="subtle" data-testid="almost-btn" onClick={setOverlayAlmost}>
          {t(lang, "almost")}
        </Button>
        <Button variant="teal" data-testid="correct-btn" onClick={() => correct(false)}>
          <Check className="size-4" />
          {t(lang, "correct")}
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2 shrink-0">
        {settings.powerCardsEnabled ? (
          <Button
            variant="ghost"
            size="sm"
            disabled={Boolean(player && boostUsed[player.teamId])}
            onClick={useBoost}
          >
            <Clock3 className="size-3.5" />
            {player && boostUsed[player.teamId] ? t(lang, "usedBoost") : t(lang, "timeBoost")}
          </Button>
        ) : (
          <div />
        )}
        <Button variant="ghost" size="sm" disabled={swapCooldown > 0} onClick={swapCard}>
          <RotateCcw className="size-3.5" />
          {swapCooldown > 0 ? `${Math.ceil(swapCooldown / 1000)}s` : t(lang, "swap")}
        </Button>
      </div>

      {overlay === "pass" && player ? (
        <Overlay>
          <p className="text-xs uppercase tracking-wider text-paper-muted">{t(lang, "passTo")}</p>
          <p className="mt-2 font-display text-3xl">{player.name}</p>
          <p className="mt-1 text-sm text-paper-muted">{tTeam(lang, player.teamColor)}</p>
          <Button
            className="mt-5 w-full"
            size="lg"
            onClick={() => {
              sound.playClick();
              revealTurn();
            }}
          >
            {t(lang, "imReady")}
          </Button>
        </Overlay>
      ) : null}

      {overlay === "paused" ? (
        <Overlay>
          <h2 className="font-display text-2xl">{t(lang, "paused")}</h2>
          <div className="mt-5 grid grid-cols-2 gap-2">
            <Button variant="ghost" className="bg-paper-ink/6 text-paper-ink" onClick={exitToWelcome}>
              {t(lang, "exit")}
            </Button>
            <Button onClick={resume}>{t(lang, "resume")}</Button>
          </div>
        </Overlay>
      ) : null}

      {overlay === "almost" ? (
        <Overlay>
          <h2 className="font-display text-2xl">{t(lang, "almostTitle")}</h2>
          <p className="mt-2 text-sm text-paper-muted">{t(lang, "almostBody")}</p>
          <div className="mt-5 grid grid-cols-2 gap-2">
            <Button variant="ghost" className="bg-paper-ink/6 text-paper-ink" onClick={() => useGame.setState({ overlay: "none" })}>
              {t(lang, "cancel")}
            </Button>
            <Button
              onClick={() => {
                useGame.setState({ overlay: "none" });
                correct(true);
              }}
            >
              {t(lang, "confirmAlmost")}
            </Button>
          </div>
        </Overlay>
      ) : null}

      {overlay === "eliminated" ? (
        <Overlay>
          <h2 className="font-display text-2xl">{t(lang, "eliminated")}</h2>
          <p className="mt-2 text-sm text-paper-muted">
            {eliminatedColor ? tTeam(lang, eliminatedColor) : ""} — {t(lang, "teamOut")}
          </p>
          <p className="mt-1 text-sm text-paper-muted">{t(lang, "remainingTeams")}</p>
          <Button className="mt-5 w-full" onClick={continueAfterElimination}>
            {t(lang, "continueRound")}
          </Button>
        </Overlay>
      ) : null}

      {overlay === "roundEnd" || overlay === "exhausted" ? (
        <Overlay>
          <h2 className="font-display text-2xl">
            {overlay === "exhausted" ? t(lang, "exhausted") : t(lang, "roundEnded", { n: currentRound })}
          </h2>
          <ul className="mt-4 space-y-1.5">
            {teams.map((tm) => (
              <li key={tm.id} className="flex items-center justify-between text-sm">
                <span>{tTeam(lang, tm.color)}</span>
                <span className="tabular font-semibold">{tm.score}</span>
              </li>
            ))}
          </ul>
          <Button className="mt-5 w-full" size="lg" onClick={nextRoundOrEnd}>
            {overlay === "exhausted" || lastRound ? t(lang, "seeResults") : t(lang, "startRound", { n: currentRound + 1 })}
          </Button>
        </Overlay>
      ) : null}

      {flashName && overlay === "none" ? (
        <div className="pointer-events-none absolute inset-x-8 top-14 rounded-2xl bg-paper px-3 py-2 text-center text-sm font-semibold text-paper-ink">
          {t(lang, "youAre")}: {flashName}
        </div>
      ) : null}
    </div>
  );
}
