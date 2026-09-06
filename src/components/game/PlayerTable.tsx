import { TEAM_COLORS } from "@/lib/game/constants";
import type { Player, Team } from "@/lib/game/types";
import { cn } from "@/lib/utils";

export function PlayerTable({
  players,
  teams,
  activeIndex,
  compact = false,
}: {
  players: Player[];
  teams: Team[];
  activeIndex: number;
  compact?: boolean;
}) {
  const n = Math.max(players.length, 1);
  const size = compact ? 168 : 236;
  const chip = compact ? 34 : 44;
  const nameH = compact ? 0 : 18;
  const radius = size / 2 - chip / 2 - (compact ? 8 : nameH + 6);

  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <div
        className="absolute rounded-full border border-white/10"
        style={{
          inset: "22%",
          background:
            "radial-gradient(circle at 50% 40%, color-mix(in oklab, var(--color-accent) 18%, #1a1520), #121018 72%)",
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06), 0 12px 40px -18px rgba(0,0,0,0.65)",
        }}
      />
      <div
        className="absolute flex items-center justify-center rounded-full border border-white/12"
        style={{
          inset: "38%",
          background: "color-mix(in oklab, var(--color-bg-elevated) 80%, black)",
        }}
      >
        <span className="font-display text-base tracking-wide text-fg/90">دور</span>
      </div>
      {players.map((p, i) => {
        const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        const team = teams.find((t) => t.id === p.teamId);
        const color = TEAM_COLORS[p.teamColor];
        const active = i === activeIndex;
        const out = team?.isEliminated;
        return (
          <div
            key={p.id}
            className="absolute left-1/2 top-1/2 flex flex-col items-center"
            style={{
              width: chip + 28,
              transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
            }}
          >
            <div
              className={cn(
                "flex items-center justify-center rounded-full text-sm font-semibold transition-transform duration-200",
                active && "scale-110",
                out && "opacity-40 grayscale",
              )}
              style={{
                width: chip,
                height: chip,
                background: color.hex,
                color: color.ink,
                boxShadow: active
                  ? `0 0 0 3px ${color.hex}, 0 0 18px ${color.soft}`
                  : `0 4px 10px ${color.soft}`,
              }}
            >
              {p.name.slice(0, 1)}
            </div>
            {!compact ? (
              <span
                className={cn(
                  "mt-1 max-w-[4.6rem] truncate text-center text-[11px] font-medium leading-tight",
                  active ? "text-fg" : "text-muted",
                )}
              >
                {p.name}
              </span>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export function TurnStrip({
  players,
  teams,
  activeIndex,
}: {
  players: Player[];
  teams: Team[];
  activeIndex: number;
}) {
  return (
    <div className="flex items-center justify-center gap-2 overflow-x-auto py-1">
      {players.map((p, i) => {
        const team = teams.find((t) => t.id === p.teamId);
        const color = TEAM_COLORS[p.teamColor];
        const active = i === activeIndex;
        return (
          <div
            key={p.id}
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-transform",
              active && "scale-110",
              team?.isEliminated && "opacity-35 grayscale",
            )}
            style={{
              background: color.hex,
              color: color.ink,
              boxShadow: active ? `0 0 0 3px ${color.hex}` : undefined,
            }}
            title={p.name}
          >
            {p.name.slice(0, 1)}
          </div>
        );
      })}
    </div>
  );
}
