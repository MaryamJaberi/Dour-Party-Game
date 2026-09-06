import type { ReactNode } from "react";

/** Header and footer stay put; only the middle pane scrolls. */
export function ScreenFrame({
  header,
  footer,
  children,
}: {
  header?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}) {
  const rows =
    header && footer
      ? "auto minmax(0,1fr) auto"
      : header
        ? "auto minmax(0,1fr)"
        : footer
          ? "minmax(0,1fr) auto"
          : "minmax(0,1fr)";
  return (
    <div
      className="h-full min-h-0 w-full"
      style={{ display: "grid", gridTemplateRows: rows, height: "100%", minHeight: 0 }}
    >
      {header ? <div className="chrome-bar sticky top-0 z-20 shrink-0 pb-1">{header}</div> : null}
      <div className="min-h-0 overflow-y-auto overscroll-contain">{children}</div>
      {footer ? <div className="chrome-bar sticky bottom-0 z-20 shrink-0 pt-2">{footer}</div> : null}
    </div>
  );
}
