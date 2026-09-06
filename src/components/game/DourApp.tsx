import { useEffect } from "react";
import "@/data/translations.more";
import { AppShell } from "@/components/game/AppShell";
import { useGame } from "@/lib/game/store";
import { HelpScreen } from "@/screens/HelpScreen";
import { HistoryScreen } from "@/screens/HistoryScreen";
import { LanguagesScreen } from "@/screens/LanguagesScreen";
import { PlayScreen } from "@/screens/PlayScreen";
import { PlayersScreen } from "@/screens/PlayersScreen";
import { ResultsScreen } from "@/screens/ResultsScreen";
import { SeatingScreen } from "@/screens/SeatingScreen";
import { SetupScreen } from "@/screens/SetupScreen";
import { TopicsScreen } from "@/screens/TopicsScreen";
import { WelcomeScreen } from "@/screens/WelcomeScreen";

export function DourApp() {
  const hydrate = useGame((s) => s.hydrate);
  const screen = useGame((s) => s.screen);
  const lang = useGame((s) => s.settings.language);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = lang === "en-US" ? "en" : lang;
  }, [lang]);

  return (
    <AppShell lang={lang}>
      <div className="h-full min-h-0">
        {screen === "welcome" && <WelcomeScreen />}
        {screen === "languages" && <LanguagesScreen />}
        {screen === "topics" && <TopicsScreen />}
        {screen === "setup" && <SetupScreen />}
        {screen === "players" && <PlayersScreen />}
        {screen === "seating" && <SeatingScreen />}
        {screen === "play" && <PlayScreen />}
        {screen === "results" && <ResultsScreen />}
        {screen === "history" && <HistoryScreen />}
        {screen === "help" && <HelpScreen />}
      </div>
    </AppShell>
  );
}
