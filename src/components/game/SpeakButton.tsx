import { Volume2 } from "lucide-react";
import { sound } from "@/lib/game/sound";
import { cn } from "@/lib/utils";

export function SpeakButton({
  text,
  lang,
  label,
  className,
  size = "md",
}: {
  text?: string | null;
  lang: string;
  label?: string;
  className?: string;
  size?: "sm" | "md";
}) {
  if (!text || !text.trim()) return null;
  return (
    <button
      type="button"
      aria-label={label || "Play pronunciation"}
      title={label || "Play pronunciation"}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full text-current transition-transform active:scale-90",
        size === "sm" ? "size-8" : "size-9",
        className,
      )}
      onClick={(e) => {
        e.stopPropagation();
        sound.speak(text, lang, { force: true });
      }}
    >
      <Volume2 className={size === "sm" ? "size-3.5" : "size-4"} />
    </button>
  );
}
