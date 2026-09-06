import phrasesData from "@/data/phrases.json";
import { WORD_BANK } from "@/data/words";
import type {
  CardGameMode,
  CEFRLevel,
  ContentType,
  Language,
  LanguageCard,
  LearningMode,
} from "./types";
import { shuffle } from "@/lib/utils";
import { MISSED_KEY } from "./constants";

interface BankPhrase {
  id: string;
  level: "A1" | "A2" | "B1";
  type: string;
  difficulty: "easy" | "medium" | "hard";
  topic: string;
  rawTopic: string;
  texts: Record<string, string>;
}

const PHRASES = phrasesData as BankPhrase[];

export const PHRASE_STATS = {
  A1: PHRASES.filter((p) => p.level === "A1").length,
  A2: PHRASES.filter((p) => p.level === "A2").length,
  B1: PHRASES.filter((p) => p.level === "B1").length,
  total: PHRASES.length,
};

function pickText(texts: Record<string, string> | Partial<Record<Language, string>>, lang: Language): string {
  const direct = texts[lang];
  if (direct) return direct;
  if (lang === "en-US") return texts.en || texts["en-US"] || "";
  if (lang === "en") return texts["en-US"] || texts.en || "";
  return texts.en || texts["en-US"] || texts.fa || "";
}

function pointsFor(d: "easy" | "medium" | "hard"): number {
  return d === "easy" ? 1 : d === "medium" ? 2 : 3;
}

function typeOf(raw: string): ContentType {
  if (raw === "Question") return "Question";
  if (raw === "Sentence") return "Sentence";
  if (raw === "Vocabulary") return "Vocabulary";
  if (raw === "Situation") return "Situation";
  return "Phrase";
}

function modeOf(content: ContentType, reverse: boolean): LearningMode {
  if (reverse) return "Reverse";
  if (content === "Question") return "Speak";
  if (content === "Vocabulary") return "Explain";
  return "Translate";
}

function loadMissedIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(MISSED_KEY);
    const parsed = raw ? (JSON.parse(raw) as string[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function rememberMissed(ids: string[]) {
  if (typeof window === "undefined") return;
  const prev = loadMissedIds();
  const next = [...new Set([...ids, ...prev])].slice(0, 200);
  localStorage.setItem(MISSED_KEY, JSON.stringify(next));
}

export function clearMissed(ids: string[]) {
  if (typeof window === "undefined") return;
  const prev = new Set(loadMissedIds());
  ids.forEach((id) => prev.delete(id));
  localStorage.setItem(MISSED_KEY, JSON.stringify([...prev]));
}

function promptFor(
  native: Language,
  target: Language,
  reverse: boolean,
  content: ContentType,
): string {
  const targetName: Record<string, { fa: string; en: string; nl: string }> = {
    "en-US": { fa: "انگلیسی آمریکایی", en: "American English", nl: "Amerikaans Engels" },
    en: { fa: "انگلیسی بریتانیایی", en: "British English", nl: "Brits Engels" },
    nl: { fa: "هلندی", en: "Dutch", nl: "Nederlands" },
    de: { fa: "آلمانی", en: "German", nl: "Duits" },
    fr: { fa: "فرانسوی", en: "French", nl: "Frans" },
    es: { fa: "اسپانیایی", en: "Spanish", nl: "Spaans" },
    it: { fa: "ایتالیایی", en: "Italian", nl: "Italiaans" },
    fa: { fa: "فارسی", en: "Persian", nl: "Perzisch" },
    ar: { fa: "عربی", en: "Arabic", nl: "Arabisch" },
    tr: { fa: "ترکی", en: "Turkish", nl: "Turks" },
    pl: { fa: "لهستانی", en: "Polish", nl: "Pools" },
    uk: { fa: "اوکراینی", en: "Ukrainian", nl: "Oekraïens" },
    zh: { fa: "چینی", en: "Chinese", nl: "Chinees" },
    ja: { fa: "ژاپنی", en: "Japanese", nl: "Japans" },
    ko: { fa: "کره‌ای", en: "Korean", nl: "Koreaans" },
    hi: { fa: "هندی", en: "Hindi", nl: "Hindi" },
    pt: { fa: "پرتغالی", en: "Portuguese", nl: "Portugees" },
  };
  const pack = targetName[target] || targetName.en;
  const loc = native === "fa" ? "fa" : native === "nl" ? "nl" : "en";
  const name = pack[loc];

  if (reverse) {
    if (loc === "fa") return `هم‌تیمی باید این را به ${name} بگوید`;
    if (loc === "nl") return `Je teamgenoot zegt dit in het ${name}`;
    return `Your teammate must say this in ${name}`;
  }
  if (content === "Vocabulary") {
    if (loc === "fa") return "این کلمه را بدون گفتن خودِ کلمه توضیح بده";
    if (loc === "nl") return "Leg dit woord uit zonder het zelf te zeggen";
    return "Explain this word without saying it";
  }
  if (loc === "fa") return "عبارت را طوری توضیح بده که یارت همان جمله را بگوید";
  if (loc === "nl") return "Beschrijf de zin zodat je partner hem zegt";
  return "Describe it so your partner says the exact phrase";
}

function fromPhrase(
  p: BankPhrase,
  target: Language,
  native: Language,
  reverse: boolean,
  forcedLevel?: LanguageCard["cefrLevel"],
): LanguageCard | null {
  const targetText = pickText(p.texts, target);
  const translation = pickText(p.texts, native);
  if (!targetText) return null;
  const content = typeOf(p.type);
  return {
    id: `${p.id}_${target}`,
    nativeLanguage: native,
    targetLanguage: target,
    cefrLevel: forcedLevel || p.level,
    topic: p.topic,
    contentType: content,
    learningMode: modeOf(content, reverse),
    prompt: promptFor(native, target, reverse, content),
    targetText,
    translation: translation || targetText,
    hint: p.rawTopic,
    difficulty: p.difficulty,
    points: pointsFor(p.difficulty),
    isReverse: reverse,
  };
}

function fromWord(
  w: (typeof WORD_BANK)[number],
  index: number,
  target: Language,
  native: Language,
  reverse: boolean,
  cefr: LanguageCard["cefrLevel"],
): LanguageCard | null {
  const targetText = pickText(w.words, target);
  const translation = pickText(w.words, native);
  if (!targetText) return null;
  return {
    id: `W_${target}_${w.category}_${index}`,
    nativeLanguage: native,
    targetLanguage: target,
    cefrLevel: cefr,
    topic: w.category,
    contentType: "Vocabulary",
    learningMode: reverse ? "Reverse" : "Explain",
    prompt: promptFor(native, target, reverse, "Vocabulary"),
    targetText,
    translation: translation || targetText,
    difficulty: w.difficulty,
    points: pointsFor(w.difficulty),
    isReverse: reverse,
  };
}

function phraseFits(p: BankPhrase, selected: CEFRLevel): boolean {
  if (selected === "all") return true;
  if (selected === p.level) return true;
  if (selected === "B2" && p.level === "B1" && p.difficulty !== "easy") return true;
  if (selected === "C1" && p.level === "B1" && p.difficulty === "hard") return true;
  if (selected === "C2" && p.level === "B1" && p.difficulty === "hard") return true;
  return false;
}

export function buildSessionCardPool(
  targetLanguages: Language[],
  selectedCategories: string[],
  cefrLevel: CEFRLevel,
  nativeLanguage: Language,
  cardGameMode: CardGameMode,
): LanguageCard[] {
  const targets = targetLanguages.length ? targetLanguages : (["nl"] as Language[]);
  const cats = new Set(selectedCategories);
  const pool: LanguageCard[] = [];

  const shouldReverse = (i: number) =>
    cardGameMode === "reverse" || (cardGameMode === "mixed" && i % 3 === 0);

  targets.forEach((target) => {
    PHRASES.forEach((p, i) => {
      if (!phraseFits(p, cefrLevel)) return;
      if (cats.size && !cats.has(p.topic)) return;
      const reverse = shouldReverse(i);
      const forced =
        cefrLevel === "B2" || cefrLevel === "C1" || cefrLevel === "C2"
          ? cefrLevel
          : undefined;
      const card = fromPhrase(p, target, nativeLanguage, reverse, forced);
      if (card) pool.push(card);
    });
  });

  if (pool.length < 24) {
    targets.forEach((target) => {
      PHRASES.forEach((p, i) => {
        if (!phraseFits(p, cefrLevel)) return;
        const reverse = shouldReverse(i + 7);
        const card = fromPhrase(p, target, nativeLanguage, reverse);
        if (card && pool.length < 80) pool.push(card);
      });
    });
  }

  if (pool.length < 20) {
    targets.forEach((target) => {
      WORD_BANK.forEach((w, i) => {
        const cefr: LanguageCard["cefrLevel"] =
          w.difficulty === "easy" ? "A1" : w.difficulty === "medium" ? "A2" : "B1";
        const card = fromWord(w, i, target, nativeLanguage, false, cefr);
        if (card && pool.length < 40) pool.push(card);
      });
    });
  }

  const missed = new Set(loadMissedIds());
  const boosted = pool.filter((c) => missed.has(c.id));
  const rest = pool.filter((c) => !missed.has(c.id));
  const mixed = [...shuffle(boosted), ...shuffle(rest)];

  return mixed.slice(0, 200).map((card, idx) => ({
    ...card,
    isGolden: idx > 0 && idx % 11 === 0,
  }));
}
