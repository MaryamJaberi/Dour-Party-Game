import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { DourApp } from "@/components/game/DourApp";
import "@/styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <DourApp />
  </StrictMode>,
);
