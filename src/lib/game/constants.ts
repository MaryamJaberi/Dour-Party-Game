import type { CEFRLevel, Language, TeamColor } from "./types";
import { TeamColor as TC } from "./types";

export const TEAM_COLORS: Record<
  TeamColor,
  { hex: string; ink: string; name: string; soft: string }
> = {
  [TC.Blue]: { hex: "#5b8eeb", ink: "#f7f2e8", name: "Blue", soft: "rgba(91,142,235,0.22)" },
  [TC.Red]: { hex: "#e05c68", ink: "#fff7f5", name: "Red", soft: "rgba(224,92,104,0.22)" },
  [TC.Green]: { hex: "#3dba8a", ink: "#06211c", name: "Green", soft: "rgba(61,186,138,0.2)" },
  [TC.Yellow]: { hex: "#e0b03a", ink: "#161410", name: "Amber", soft: "rgba(224,176,58,0.22)" },
};

export const TEAM_ORDER: TeamColor[] = [TC.Blue, TC.Red, TC.Green, TC.Yellow];

export interface LanguageInfo {
  code: Language;
  name: string;
  nativeName: string;
  direction: "rtl" | "ltr";
  speech: string;
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: "fa", name: "Persian", nativeName: "فارسی", direction: "rtl", speech: "fa-IR" },
  { code: "en", name: "English (UK)", nativeName: "English", direction: "ltr", speech: "en-GB" },
  { code: "en-US", name: "English (US)", nativeName: "English (US)", direction: "ltr", speech: "en-US" },
  { code: "nl", name: "Dutch", nativeName: "Nederlands", direction: "ltr", speech: "nl-NL" },
  { code: "de", name: "German", nativeName: "Deutsch", direction: "ltr", speech: "de-DE" },
  { code: "fr", name: "French", nativeName: "Français", direction: "ltr", speech: "fr-FR" },
  { code: "es", name: "Spanish", nativeName: "Español", direction: "ltr", speech: "es-ES" },
  { code: "it", name: "Italian", nativeName: "Italiano", direction: "ltr", speech: "it-IT" },
  { code: "pt", name: "Portuguese", nativeName: "Português", direction: "ltr", speech: "pt-PT" },
  { code: "ar", name: "Arabic", nativeName: "العربية", direction: "rtl", speech: "ar-SA" },
  { code: "tr", name: "Turkish", nativeName: "Türkçe", direction: "ltr", speech: "tr-TR" },
  { code: "pl", name: "Polish", nativeName: "Polski", direction: "ltr", speech: "pl-PL" },
  { code: "uk", name: "Ukrainian", nativeName: "Українська", direction: "ltr", speech: "uk-UA" },
  { code: "zh", name: "Chinese", nativeName: "中文", direction: "ltr", speech: "zh-CN" },
  { code: "ja", name: "Japanese", nativeName: "日本語", direction: "ltr", speech: "ja-JP" },
  { code: "ko", name: "Korean", nativeName: "한국어", direction: "ltr", speech: "ko-KR" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", direction: "ltr", speech: "hi-IN" },
];

export const UI_LANGUAGES: Language[] = SUPPORTED_LANGUAGES.map((l) => l.code);

export const TOPIC_IDS = [
  "CAT_EVERYDAY",
  "CAT_RESTAURANT",
  "CAT_FOOD",
  "CAT_TRAVEL",
  "CAT_TRANSPORT",
  "CAT_SHOPPING",
  "CAT_WORK",
  "CAT_EDUCATION",
  "CAT_FAMILY",
  "CAT_SOCIAL",
  "CAT_HEALTH",
  "CAT_CITY",
  "CAT_TECH",
  "CAT_SMALLTALK",
  "CAT_SPORTS",
  "CAT_NATURE",
] as const;

export const DEFAULT_TOPICS = [
  "CAT_EVERYDAY",
  "CAT_RESTAURANT",
  "CAT_FOOD",
  "CAT_TRAVEL",
  "CAT_SHOPPING",
  "CAT_WORK",
  "CAT_SMALLTALK",
  "CAT_SOCIAL",
  "CAT_FAMILY",
  "CAT_HEALTH",
];

export interface CefrInfo {
  id: CEFRLevel;
  label: Record<"fa" | "en" | "nl", string>;
  desc: Record<"fa" | "en" | "nl", string>;
}

export const CEFR_LEVELS: CefrInfo[] = [
  {
    id: "A1",
    label: { fa: "مبتدی A1", en: "Beginner A1", nl: "Beginner A1" },
    desc: {
      fa: "۴۴۰+ عبارت پایه: سلام، خانواده، خرید، مسیر",
      en: "440+ basics: greetings, family, shopping, directions",
      nl: "440+ basis: groeten, familie, winkelen",
    },
  },
  {
    id: "A2",
    label: { fa: "مقدماتی A2", en: "Elementary A2", nl: "Elementair A2" },
    desc: {
      fa: "۹۷۰+ جمله روزمره: گذشته، آینده، سفر و نظر",
      en: "970+ everyday sentences: past, future, travel",
      nl: "970+ alledaagse zinnen: verleden, toekomst",
    },
  },
  {
    id: "B1",
    label: { fa: "متوسط B1", en: "Intermediate B1", nl: "Gemiddeld B1" },
    desc: {
      fa: "۹۹۰+ مکالمه طبیعی کار، سفر و اصطلاحات",
      en: "990+ natural talk for work, travel and idioms",
      nl: "990+ natuurlijke gesprekken over werk en reis",
    },
  },
  {
    id: "B2",
    label: { fa: "فوق متوسط B2", en: "Upper B2", nl: "Boven gemiddeld B2" },
    desc: {
      fa: "عبارت سخت‌تر B1 برای چالش بیشتر",
      en: "Harder B1 phrases for a tougher round",
      nl: "Moeilijkere B1-zinnen voor extra uitdaging",
    },
  },
  {
    id: "C1",
    label: { fa: "پیشرفته C1", en: "Advanced C1", nl: "Gevorderd C1" },
    desc: {
      fa: "اصطلاحات و جمله‌های سخت بانک B1",
      en: "Idioms and the hardest B1 bank items",
      nl: "Idiomen en de moeilijkste B1-items",
    },
  },
  {
    id: "all",
    label: { fa: "ترکیبی", en: "Mixed", nl: "Gemengd" },
    desc: {
      fa: "۲۴۰۰+ کارت از A1 تا B1 با هم",
      en: "2400+ cards mixed from A1 to B1",
      nl: "2400+ kaarten gemengd van A1 tot B1",
    },
  },
];

export const SETTINGS_KEY = "dour_settings_v2";
export const HISTORY_KEY = "dour_history_v2";
export const MISSED_KEY = "dour_missed_v1";

export function langInfo(code: Language): LanguageInfo {
  return SUPPORTED_LANGUAGES.find((l) => l.code === code) ?? SUPPORTED_LANGUAGES[1];
}

/** Short greeting used to preview pronunciation for each language. */
export const VOICE_SAMPLES: Record<Language, string> = {
  fa: "سلام، حالت چطوره؟",
  en: "Hello, how are you today?",
  "en-US": "Hi, how are you doing?",
  nl: "Hallo, hoe gaat het?",
  de: "Hallo, wie geht es dir?",
  fr: "Bonjour, comment ça va ?",
  es: "Hola, ¿qué tal?",
  it: "Ciao, come stai?",
  pt: "Olá, tudo bem?",
  ar: "مرحبا، كيف حالك؟",
  tr: "Merhaba, nasılsın?",
  pl: "Cześć, jak się masz?",
  uk: "Привіт, як справи?",
  zh: "你好，你好吗？",
  ja: "こんにちは、元気ですか？",
  ko: "안녕하세요, 잘 지내세요?",
  hi: "नमस्ते, आप कैसे हैं?",
};
