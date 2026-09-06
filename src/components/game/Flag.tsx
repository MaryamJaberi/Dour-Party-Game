import type { Language } from "@/lib/game/types";

const FLAGS: Record<string, { stripes: string[]; emblem?: string }> = {
  fa: { stripes: ["#239f40", "#fff", "#da0000"] },
  en: { stripes: ["#012169", "#fff", "#c8102e"] },
  "en-US": { stripes: ["#b22234", "#fff", "#3c3b6e"] },
  nl: { stripes: ["#ae1c28", "#fff", "#21468b"] },
  de: { stripes: ["#000", "#dd0000", "#ffce00"] },
  fr: { stripes: ["#0055a4", "#fff", "#ef4135"] },
  es: { stripes: ["#aa151b", "#f1bf00", "#aa151b"] },
  it: { stripes: ["#009246", "#fff", "#ce2b37"] },
  pt: { stripes: ["#006600", "#ff0000", "#006600"] },
  ar: { stripes: ["#006c35", "#fff", "#006c35"] },
  tr: { stripes: ["#e30a17", "#e30a17", "#e30a17"] },
  pl: { stripes: ["#fff", "#fff", "#dc143c"] },
  uk: { stripes: ["#005bbb", "#005bbb", "#ffd500"] },
  zh: { stripes: ["#de2910", "#de2910", "#de2910"] },
  ja: { stripes: ["#fff", "#bc002d", "#fff"] },
  ko: { stripes: ["#fff", "#cd2e3a", "#0047a0"] },
  hi: { stripes: ["#ff9933", "#fff", "#138808"] },
};

export function Flag({ code, size = 18 }: { code: Language | string; size?: number }) {
  const f = FLAGS[code] || FLAGS.en;
  const h = Math.round(size * 0.72);
  return (
    <svg
      width={size}
      height={h}
      viewBox="0 0 60 42"
      className="inline-block shrink-0 overflow-hidden rounded-[3px] ring-1 ring-black/20"
      aria-hidden
    >
      <rect width="60" height="14" fill={f.stripes[0]} />
      <rect y="14" width="60" height="14" fill={f.stripes[1]} />
      <rect y="28" width="60" height="14" fill={f.stripes[2]} />
    </svg>
  );
}
