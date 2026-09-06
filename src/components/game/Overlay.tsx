import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Overlay({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className="absolute inset-0 z-40 flex items-center justify-center p-4"
      style={{ background: "var(--color-bg)" }}
    >
      <div className={cn("w-full max-w-sm paper-card rounded-[28px] p-5 shadow-soft", className)}>
        {children}
      </div>
    </div>
  );
}
