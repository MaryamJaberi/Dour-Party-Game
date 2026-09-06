import { useEffect } from "react";

/** Keep the app inside the visible Safari/Chrome viewport, not under the URL bar. */
export function ViewportLock() {
  useEffect(() => {
    const apply = () => {
      const vv = window.visualViewport;
      const h = Math.round(vv?.height || window.innerHeight);
      const top = Math.round(vv?.offsetTop || 0);
      document.documentElement.style.setProperty("--app-h", `${h}px`);
      document.documentElement.style.setProperty("--app-top", `${top}px`);
    };
    apply();
    window.visualViewport?.addEventListener("resize", apply);
    window.visualViewport?.addEventListener("scroll", apply);
    window.addEventListener("orientationchange", apply);
    return () => {
      window.visualViewport?.removeEventListener("resize", apply);
      window.visualViewport?.removeEventListener("scroll", apply);
      window.removeEventListener("orientationchange", apply);
    };
  }, []);
  return null;
}
