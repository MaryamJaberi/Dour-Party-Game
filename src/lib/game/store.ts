import { create } from "zustand";
import { getRandomCharacters } from "./characters";
import { buildSessionCardPool, rememberMissed, clearMissed } from "./cards";
import {
  DEFAULT_TOPICS,
  HISTORY_KEY,
  SETTINGS_KEY,
  TEAM_ORDER,
} from "./constants";
import { sound } from "./sound";
import type {
  GameHistoryEntry,
  GameSettings,
  LanguageCard,
  PlayedCardRecord,
  Player,
  PlayOverlay,
  ScreenId,
  Team,
  UndoSnapshot,
} from "./types";
import { TeamColor } from "./types";

const DEFAULT_SETTINGS: GameSettings = {
  playerCount: 4,
  roundsCount: 3,
  roundDuration: 60,
  difficulty: "all",
  cefrLevel: "B1",
  selectedCategories: [...DEFAULT_TOPICS],
  playerNames: getRandomCharacters("fa", 8),
  language: "fa",
  nativeLanguage: "fa",
  targetLanguages: ["nl"],
  soundEnabled: true,
  autoPronounceOnCorrect: true,
  cardGameMode: "mixed",
  passPhoneScreenEnabled: true,
  powerCardsEnabled: true,
};

function loadSettings(): GameSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<GameSettings>;
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      targetLanguages:
        Array.isArray(parsed.targetLanguages) && parsed.targetLanguages.length
          ? parsed.targetLanguages
          : DEFAULT_SETTINGS.targetLanguages,
      selectedCategories:
        Array.isArray(parsed.selectedCategories) && parsed.selectedCategories.length
          ? parsed.selectedCategories
          : DEFAULT_SETTINGS.selectedCategories,
      playerNames: Array.isArray(parsed.playerNames)
        ? parsed.playerNames
        : DEFAULT_SETTINGS.playerNames,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function loadHistory(): GameHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    const parsed = raw ? (JSON.parse(raw) as GameHistoryEntry[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function buildTeamsAndPlayers(settings: GameSettings): { teams: Team[]; players: Player[] } {
  const teamCount = settings.playerCount / 2;
  const ms = settings.roundDuration * 1000;
  const teams: Team[] = Array.from({ length: teamCount }, (_, i) => ({
    id: i,
    color: TEAM_ORDER[i],
    timeRemaining: ms,
    isEliminated: false,
    playerIds: [i, i + teamCount],
    score: 0,
    comboStreak: 0,
  }));
  const defaults = getRandomCharacters(settings.nativeLanguage || settings.language, settings.playerCount);
  const players: Player[] = Array.from({ length: settings.playerCount }, (_, i) => {
    const teamId = i % teamCount;
    const name = settings.playerNames[i]?.trim() || defaults[i] || `P${i + 1}`;
    return { id: i, name, teamId, teamColor: TEAM_ORDER[teamId] };
  });
  return { teams, players };
}

function nextAliveIndex(players: Player[], teams: Team[], from: number): number {
  for (let step = 1; step <= players.length; step++) {
    const idx = (from + step) % players.length;
    const team = teams.find((t) => t.id === players[idx].teamId);
    if (team && !team.isEliminated && team.timeRemaining > 0) return idx;
  }
  return from;
}

function aliveTeamCount(teams: Team[]): number {
  return teams.filter((t) => !t.isEliminated && t.timeRemaining > 0).length;
}

export interface GameState {
  hydrated: boolean;
  screen: ScreenId;
  helpFrom: ScreenId;
  overlay: PlayOverlay;
  eliminatedColor: TeamColor | null;
  settings: GameSettings;
  history: GameHistoryEntry[];
  teams: Team[];
  players: Player[];
  currentRound: number;
  activePlayerIndex: number;
  roundTimer: number;
  pool: LanguageCard[];
  poolIndex: number;
  currentCard: LanguageCard | null;
  swapCooldown: number;
  playedCards: PlayedCardRecord[];
  undo: UndoSnapshot | null;
  undoLeft: number;
  streak: number;
  boostUsed: Record<number, boolean>;
  showHint: boolean;
  cardStartedAt: number;
  flashName: string | null;
  toast: string | null;

  hydrate: () => void;
  setScreen: (s: ScreenId) => void;
  openHelp: () => void;
  closeHelp: () => void;
  patchSettings: (partial: Partial<GameSettings>) => void;
  prepareSeating: () => void;
  confirmSeating: () => void;
  revealTurn: () => void;
  tick: (delta: number) => void;
  correct: (almost?: boolean) => void;
  skip: () => void;
  swapCard: () => void;
  useBoost: () => void;
  undoLast: () => void;
  pause: () => void;
  resume: () => void;
  continueAfterElimination: () => void;
  nextRoundOrEnd: () => void;
  exitToWelcome: () => void;
  playAgain: () => void;
  setHint: (v: boolean) => void;
  tickUndo: () => void;
}

export const useGame = create<GameState>((set, get) => ({
  hydrated: false,
  screen: "welcome",
  helpFrom: "welcome",
  overlay: "none",
  eliminatedColor: null,
  settings: DEFAULT_SETTINGS,
  history: [],
  teams: [],
  players: [],
  currentRound: 1,
  activePlayerIndex: 0,
  roundTimer: 60000,
  pool: [],
  poolIndex: 0,
  currentCard: null,
  swapCooldown: 0,
  playedCards: [],
  undo: null,
  undoLeft: 0,
  streak: 0,
  boostUsed: {},
  showHint: false,
  cardStartedAt: 0,
  flashName: null,
  toast: null,

  hydrate: () => {
    if (get().hydrated) return;
    const settings = loadSettings();
    sound.setSoundEnabled(settings.soundEnabled);
    set({ hydrated: true, settings, history: loadHistory() });
  },

  setScreen: (screen) => {
    const { settings } = get();
    if (settings.soundEnabled) {
      if (screen === "play") sound.stopMenuBGM();
      else sound.startMenuBGM();
    }
    set({ screen, overlay: "none" });
  },

  openHelp: () => {
    const { screen } = get();
    if (screen === "play") set({ overlay: "paused", helpFrom: "play", screen: "help" });
    else set({ helpFrom: screen, screen: "help" });
  },

  closeHelp: () => {
    const { helpFrom } = get();
    if (helpFrom === "play") set({ screen: "play", overlay: "paused" });
    else set({ screen: helpFrom, overlay: "none" });
  },

  patchSettings: (partial) => {
    const settings = { ...get().settings, ...partial };
    if (partial.language && !partial.nativeLanguage) {
      settings.nativeLanguage = partial.language;
    }
    set({ settings });
    if (typeof window !== "undefined") {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    }
    if (partial.soundEnabled !== undefined) {
      sound.setSoundEnabled(partial.soundEnabled);
      if (partial.soundEnabled) sound.startMenuBGM();
      else sound.setMuted(true);
    }
  },

  prepareSeating: () => {
    const { settings } = get();
    const { teams, players } = buildTeamsAndPlayers(settings);
    const names = players.map((p) => p.name);
    const nextSettings = { ...settings, playerNames: names.concat(settings.playerNames.slice(names.length)) };
    const pool = buildSessionCardPool(
      settings.targetLanguages,
      settings.selectedCategories,
      settings.cefrLevel,
      settings.nativeLanguage,
      settings.cardGameMode,
    );
    const currentCard = pool[0] ?? null;
    set({
      settings: nextSettings,
      teams,
      players,
      pool,
      poolIndex: currentCard ? 1 : 0,
      currentCard,
      currentRound: 1,
      activePlayerIndex: 0,
      roundTimer: settings.roundDuration * 1000,
      swapCooldown: 15000,
      playedCards: [],
      undo: null,
      streak: 0,
      boostUsed: {},
      showHint: false,
      overlay: "none",
      screen: "seating",
    });
    if (typeof window !== "undefined") {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(nextSettings));
    }
  },

  confirmSeating: () => {
    const { settings } = get();
    sound.stopMenuBGM();
    sound.playStartGame?.();
    set({
      screen: "play",
      overlay: settings.passPhoneScreenEnabled ? "pass" : "none",
      cardStartedAt: Date.now(),
    });
  },

  revealTurn: () => {
    set({ overlay: "none", cardStartedAt: Date.now(), flashName: null });
  },

  tick: (delta) => {
    const { overlay, screen, teams, players, activePlayerIndex, roundTimer, swapCooldown } = get();
    if (screen !== "play" || overlay !== "none") return;

    const player = players[activePlayerIndex];
    let nextTeams = teams;
    let eliminated: TeamColor | null = null;
    if (player) {
      nextTeams = teams.map((t) => {
        if (t.id !== player.teamId || t.isEliminated) return t;
        const timeRemaining = Math.max(0, t.timeRemaining - delta);
        if (timeRemaining === 0 && t.timeRemaining > 0) {
          eliminated = t.color;
          return { ...t, timeRemaining: 0, isEliminated: true };
        }
        return { ...t, timeRemaining };
      });
    }

    const nextRound = Math.max(0, roundTimer - delta);
    const nextSwap = Math.max(0, swapCooldown - delta);

    if (eliminated) {
      sound.playBuzzer();
      const remaining = aliveTeamCount(nextTeams);
      set({
        teams: nextTeams,
        roundTimer: nextRound,
        swapCooldown: nextSwap,
        eliminatedColor: eliminated,
        overlay: remaining <= 1 ? "roundEnd" : "eliminated",
      });
      return;
    }

    if (nextRound <= 0) {
      sound.playBuzzer();
      set({ teams: nextTeams, roundTimer: 0, swapCooldown: nextSwap, overlay: "roundEnd" });
      return;
    }

    set({ teams: nextTeams, roundTimer: nextRound, swapCooldown: nextSwap });
  },

  correct: (almost = false) => {
    const state = get();
    const { currentCard, players, activePlayerIndex, teams, playedCards, settings, streak, showHint, cardStartedAt } =
      state;
    if (!currentCard) return;
    sound.playCorrect();
    if (settings.autoPronounceOnCorrect) {
      sound.speakTargetPhrase(currentCard.targetText, currentCard.targetLanguage);
    }
    const player = players[activePlayerIndex];
    const timeSpent = (Date.now() - cardStartedAt) / 1000;
    const speed = timeSpent < 8;
    let pts = currentCard.points;
    if (currentCard.isGolden) pts *= 2;
    if (almost) pts = Math.max(1, Math.ceil(pts / 2));
    if (speed && !almost) pts += 1;

    const snapshot: UndoSnapshot = {
      activePlayerIndex,
      currentCard,
      poolIndex: state.poolIndex,
      roundTimer: state.roundTimer,
      teams: JSON.parse(JSON.stringify(teams)) as Team[],
      playedCards: [...playedCards],
      streak,
    };

    const record: PlayedCardRecord = {
      card: currentCard,
      guessedCorrectly: true,
      answeringPlayerName: player?.name || "",
      answeringTeamColor: player?.teamColor || TeamColor.Blue,
      timeSpentSeconds: Math.round(timeSpent),
      wasSpeedBonus: speed && !almost,
      wasAlmost: almost,
      pointsEarned: pts,
      usedHint: showHint,
    };

    const nextTeams = teams.map((t) =>
      t.id === player?.teamId
        ? { ...t, score: t.score + pts, comboStreak: t.comboStreak + 1 }
        : { ...t, comboStreak: t.id === player?.teamId ? t.comboStreak : 0 },
    );
    const nextIndex = nextAliveIndex(players, nextTeams, activePlayerIndex);
    const nextCard = state.pool[state.poolIndex] ?? null;
    const exhausted = !nextCard;
    clearMissed([currentCard.id]);

    let toast: string | null = null;
    if (currentCard.isGolden) toast = "golden";
    else if (speed && !almost) toast = "speed";
    else if (streak + 1 >= 3) toast = "combo";

    set({
      teams: nextTeams,
      playedCards: [...playedCards, record],
      activePlayerIndex: nextIndex,
      currentCard: nextCard,
      poolIndex: state.poolIndex + (nextCard ? 1 : 0),
      undo: snapshot,
      undoLeft: 3,
      streak: almost ? 0 : streak + 1,
      showHint: false,
      overlay: exhausted ? "exhausted" : settings.passPhoneScreenEnabled ? "pass" : "none",
      cardStartedAt: Date.now(),
      flashName: players[nextIndex]?.name ?? null,
      toast,
      swapCooldown: 15000,
    });
  },

  skip: () => {
    const state = get();
    const { currentCard, players, activePlayerIndex, teams, playedCards, settings, cardStartedAt, showHint } = state;
    if (!currentCard) return;
    sound.playBuzzer();
    const player = players[activePlayerIndex];
    const snapshot: UndoSnapshot = {
      activePlayerIndex,
      currentCard,
      poolIndex: state.poolIndex,
      roundTimer: state.roundTimer,
      teams: JSON.parse(JSON.stringify(teams)) as Team[],
      playedCards: [...playedCards],
      streak: state.streak,
    };
    const record: PlayedCardRecord = {
      card: currentCard,
      guessedCorrectly: false,
      answeringPlayerName: player?.name || "",
      answeringTeamColor: player?.teamColor || TeamColor.Blue,
      timeSpentSeconds: Math.round((Date.now() - cardStartedAt) / 1000),
      wasSpeedBonus: false,
      wasAlmost: false,
      pointsEarned: 0,
      usedHint: showHint,
    };
    rememberMissed([currentCard.id]);
    const nextTeams = teams.map((t) => (t.id === player?.teamId ? { ...t, comboStreak: 0 } : t));
    const nextIndex = nextAliveIndex(players, nextTeams, activePlayerIndex);
    const nextCard = state.pool[state.poolIndex] ?? null;
    set({
      teams: nextTeams,
      playedCards: [...playedCards, record],
      activePlayerIndex: nextIndex,
      currentCard: nextCard,
      poolIndex: state.poolIndex + (nextCard ? 1 : 0),
      undo: snapshot,
      undoLeft: 3,
      streak: 0,
      showHint: false,
      overlay: !nextCard ? "exhausted" : settings.passPhoneScreenEnabled ? "pass" : "none",
      cardStartedAt: Date.now(),
      flashName: players[nextIndex]?.name ?? null,
      swapCooldown: 15000,
    });
  },

  swapCard: () => {
    const { swapCooldown, pool, poolIndex } = get();
    if (swapCooldown > 0) return;
    sound.playToggle?.();
    const nextCard = pool[poolIndex] ?? null;
    if (!nextCard) {
      set({ overlay: "exhausted" });
      return;
    }
    set({
      currentCard: nextCard,
      poolIndex: poolIndex + 1,
      swapCooldown: 15000,
      showHint: false,
      cardStartedAt: Date.now(),
    });
  },

  useBoost: () => {
    const { settings, players, activePlayerIndex, boostUsed, roundTimer, teams } = get();
    if (!settings.powerCardsEnabled) return;
    const player = players[activePlayerIndex];
    if (!player || boostUsed[player.teamId]) return;
    sound.playPowerUp?.();
    set({
      roundTimer: roundTimer + 10000,
      teams: teams.map((t) =>
        t.id === player.teamId ? { ...t, timeRemaining: t.timeRemaining + 10000 } : t,
      ),
      boostUsed: { ...boostUsed, [player.teamId]: true },
      toast: "boost",
    });
  },

  undoLast: () => {
    const { undo } = get();
    if (!undo) return;
    sound.playClick();
    set({
      activePlayerIndex: undo.activePlayerIndex,
      currentCard: undo.currentCard,
      poolIndex: undo.poolIndex,
      roundTimer: undo.roundTimer,
      teams: undo.teams,
      playedCards: undo.playedCards,
      streak: undo.streak,
      undo: null,
      undoLeft: 0,
      overlay: "none",
      showHint: false,
      cardStartedAt: Date.now(),
    });
  },

  pause: () => set({ overlay: "paused" }),
  resume: () => set({ overlay: "none", cardStartedAt: Date.now() }),

  continueAfterElimination: () => {
    const { players, teams, activePlayerIndex, settings } = get();
    if (aliveTeamCount(teams) <= 1) {
      set({ overlay: "roundEnd" });
      return;
    }
    const nextIndex = nextAliveIndex(players, teams, activePlayerIndex);
    set({
      activePlayerIndex: nextIndex,
      overlay: settings.passPhoneScreenEnabled ? "pass" : "none",
      eliminatedColor: null,
      cardStartedAt: Date.now(),
    });
  },

  nextRoundOrEnd: () => {
    const state = get();
    if (state.overlay === "exhausted" || state.currentRound >= state.settings.roundsCount) {
      finishMatch(set, get);
      return;
    }
    const ms = state.settings.roundDuration * 1000;
    set({
      currentRound: state.currentRound + 1,
      roundTimer: ms,
      teams: state.teams.map((t) => ({
        ...t,
        timeRemaining: ms,
        isEliminated: false,
      })),
      boostUsed: {},
      overlay: state.settings.passPhoneScreenEnabled ? "pass" : "none",
      cardStartedAt: Date.now(),
      swapCooldown: 15000,
    });
    sound.playStartGame?.();
  },

  exitToWelcome: () => {
    sound.startMenuBGM();
    set({
      screen: "welcome",
      overlay: "none",
      teams: [],
      players: [],
      currentCard: null,
      playedCards: [],
    });
  },

  playAgain: () => {
    get().prepareSeating();
  },

  setHint: (v) => set({ showHint: v }),

  tickUndo: () => {
    const { undoLeft, undo } = get();
    if (!undo) return;
    if (undoLeft <= 1) set({ undo: null, undoLeft: 0 });
    else set({ undoLeft: undoLeft - 1 });
  },
}));

function finishMatch(
  set: (partial: Partial<GameState>) => void,
  get: () => GameState,
) {
  const { teams, players, settings, playedCards, history } = get();
  const maxScore = Math.max(0, ...teams.map((t) => t.score));
  const winners = teams.filter((t) => t.score === maxScore && maxScore > 0);
  const fallback = teams.slice().sort((a, b) => b.timeRemaining - a.timeRemaining);
  const winTeams = winners.length ? winners : [fallback[0]].filter(Boolean);
  const isTie = winTeams.length > 1;
  const correct = playedCards.filter((c) => c.guessedCorrectly).length;
  const entry: GameHistoryEntry = {
    id: Date.now().toString(),
    date: new Date().toISOString(),
    players: players.map((p) => p.name),
    winnerColor: isTie ? "TIE" : winTeams[0]?.color || TeamColor.Blue,
    winnerNames: isTie
      ? winTeams.map((w) => w.color)
      : players.filter((p) => p.teamId === winTeams[0]?.id).map((p) => p.name),
    language: settings.language,
    targetLanguages: settings.targetLanguages,
    cefrLevel: settings.cefrLevel,
    totalScore: teams.reduce((s, t) => s + t.score, 0),
    playedCardsCount: playedCards.length,
    accuracy: playedCards.length ? Math.round((correct / playedCards.length) * 100) : 0,
  };
  const nextHistory = [entry, ...history].slice(0, 30);
  if (typeof window !== "undefined") {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(nextHistory));
  }
  sound.playWinner?.();
  set({ history: nextHistory, screen: "results", overlay: "none" });
}
