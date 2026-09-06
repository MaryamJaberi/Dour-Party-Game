import type { Language } from "./types";

const NAMES: Record<string, string[]> = {
  fa: ["نیکا", "آریا", "سارا", "کسری", "رها", "کیان", "دریا", "پارسا", "هلنا", "نیکان", "یاسمن", "رادین"],
  en: ["Mina", "Leo", "Nora", "Omar", "Ivy", "Hugo", "Lara", "Nico", "Ava", "Ezra", "Sia", "Theo"],
  nl: ["Noor", "Lars", "Eva", "Daan", "Lina", "Sem", "Mila", "Bram", "Sofie", "Joris", "Fien", "Noud"],
  de: ["Mia", "Jonas", "Lea", "Finn", "Emma", "Luis", "Nora", "Ben", "Lina", "Max", "Clara", "Tim"],
  fr: ["Léa", "Hugo", "Chloé", "Louis", "Inès", "Noah", "Jade", "Léo", "Alice", "Paul", "Lina", "Adam"],
  ar: ["ليلى", "يوسف", "نور", "أمين", "هند", "كريم", "سارة", "زياد", "رنا", "فهد", "آية", "سامي"],
  es: ["Luna", "Diego", "Sofía", "Mateo", "Valeria", "Leo", "Camila", "Hugo", "Elena", "Marco", "Nuria", "Pablo"],
  tr: ["Elif", "Emir", "Zeynep", "Can", "Defne", "Kaan", "Ece", "Deniz", "Selin", "Mert", "Aylin", "Ege"],
  pl: ["Zosia", "Jan", "Maja", "Kuba", "Lena", "Adam", "Ola", "Tomek", "Ania", "Piotr", "Hania", "Bartek"],
  uk: ["Мія", "Артем", "Софія", "Макс", "Анна", "Іван", "Ліза", "Олег", "Даша", "Тарас", "Юля", "Богдан"],
};

export function getRandomCharacters(lang: Language | string = "fa", count = 8): string[] {
  const key = lang === "en-US" ? "en" : lang;
  const pool = NAMES[key] || NAMES.en;
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return Array.from({ length: count }, (_, i) => shuffled[i % shuffled.length]);
}
