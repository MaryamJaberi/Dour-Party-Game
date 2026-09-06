export enum TeamColor {
  Blue = "BLUE",
  Red = "RED",
  Green = "GREEN",
  Yellow = "YELLOW",
}

export type Language =
  | "fa"
  | "en"
  | "en-US"
  | "nl"
  | "de"
  | "fr"
  | "ar"
  | "tr"
  | "pl"
  | "uk"
  | "es"
  | "it"
  | "zh"
  | "ja"
  | "ko"
  | "hi"
  | "pt";

export type CEFRLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2" | "all";

export type ContentType =
  | "Vocabulary"
  | "Phrase"
  | "Sentence"
  | "Situation"
  | "Question"
  | "Response"
  | "FillInTheBlank";

export type LearningMode =
  | "Explain"
  | "Translate"
  | "Speak"
  | "Complete"
  | "Situation"
  | "Reverse";

export type CardGameMode = "mixed" | "reverse" | "standard";

export type DifficultyLevel = "easy" | "medium" | "hard" | "all";

export interface LanguageCard {
  id: string;
  nativeLanguage?: Language;
  targetLanguage: Language;
  cefrLevel: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  topic: string;
  contentType: ContentType;
  learningMode: LearningMode;
  prompt: string;
  targetText: string;
  translation: string;
  hint?: string;
  grammarPoint?: string;
  pronunciation?: string;
  difficulty: "easy" | "medium" | "hard";
  points: number;
  isGolden?: boolean;
  isReverse?: boolean;
}

export interface Player {
  id: number;
  name: string;
  teamId: number;
  teamColor: TeamColor;
}

export interface Team {
  id: number;
  color: TeamColor;
  timeRemaining: number;
  isEliminated: boolean;
  playerIds: number[];
  score: number;
  comboStreak: number;
}

export interface GameSettings {
  playerCount: 4 | 6 | 8;
  roundsCount: number;
  roundDuration: number;
  difficulty: DifficultyLevel;
  cefrLevel: CEFRLevel;
  selectedCategories: string[];
  playerNames: string[];
  language: Language;
  nativeLanguage: Language;
  targetLanguages: Language[];
  soundEnabled: boolean;
  autoPronounceOnCorrect: boolean;
  cardGameMode: CardGameMode;
  passPhoneScreenEnabled: boolean;
  powerCardsEnabled: boolean;
}

export interface PlayedCardRecord {
  card: LanguageCard;
  guessedCorrectly: boolean;
  answeringPlayerName: string;
  answeringTeamColor: TeamColor;
  timeSpentSeconds: number;
  wasSpeedBonus: boolean;
  wasAlmost: boolean;
  pointsEarned: number;
  usedHint: boolean;
}

export interface UndoSnapshot {
  activePlayerIndex: number;
  currentCard: LanguageCard | null;
  poolIndex: number;
  roundTimer: number;
  teams: Team[];
  playedCards: PlayedCardRecord[];
  streak: number;
}

export interface GameHistoryEntry {
  id: string;
  date: string;
  players: string[];
  winnerColor: TeamColor | "TIE";
  winnerNames: string[];
  language: Language;
  targetLanguages: Language[];
  cefrLevel: CEFRLevel;
  totalScore: number;
  playedCardsCount: number;
  accuracy: number;
}

export type ScreenId =
  | "welcome"
  | "languages"
  | "topics"
  | "setup"
  | "players"
  | "seating"
  | "play"
  | "results"
  | "history"
  | "help";

export type PlayOverlay =
  | "none"
  | "pass"
  | "paused"
  | "help"
  | "almost"
  | "eliminated"
  | "roundEnd"
  | "exhausted";
