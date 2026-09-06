import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function CollapsedList({
  label,
  summary,
  open,
  onToggle,
  children,
}: {
  label: string;
  summary: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-bg-elevated">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-3 py-3 text-start"
        aria-expanded={open}
      >
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-medium uppercase tracking-wider text-muted">{label}</div>
          <div className="mt-0.5 truncate text-sm font-semibold text-fg">{summary}</div>
        </div>
        <ChevronDown className={cn("size-4 shrink-0 text-muted transition-transform", open && "rotate-180")} />
      </button>
      {open ? <div className="border-t border-border px-2 pb-2 pt-2">{children}</div> : null}
    </section>
  );
}

export function NamePill({
  label,
  active,
  onClick,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-9 rounded-xl px-3 text-sm font-medium",
        active ? "bg-paper text-paper-ink" : "bg-bg-subtle text-fg hover:bg-bg",
      )}
    >
      {label}
    </button>
  );
}
