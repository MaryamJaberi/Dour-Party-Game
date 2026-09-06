import type { ReactNode } from "react";
import { ViewportLock } from "@/components/game/ViewportLock";
import { isRtl } from "@/lib/utils";
import type { Language } from "@/lib/game/types";

export function AppShell({
  lang,
  children,
}: {
  lang: Language;
  children: ReactNode;
}) {
  return (
    <div
      className="felt-bg relative flex w-full justify-center overflow-hidden"
      dir={isRtl(lang) ? "rtl" : "ltr"}
      style={{
        height: "var(--app-h, 100svh)",
        maxHeight: "var(--app-h, 100svh)",
        marginTop: "var(--app-top, 0px)",
      }}
    >
      <ViewportLock />
      <div className="party-twinkle" aria-hidden />
      <div className="flex h-full min-h-0 w-full max-w-md flex-col overflow-hidden px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1 sm:border-x sm:border-border/70 sm:bg-bg/40 sm:px-4">
        {children}
      </div>
    </div>
  );
}
