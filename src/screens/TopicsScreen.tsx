import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CollapsedList } from "@/components/game/CollapsedList";
import { ScreenFrame } from "@/components/game/ScreenFrame";
import { TopBar } from "@/components/game/TopBar";
import { TOPIC_IDS } from "@/lib/game/constants";
import { t, tCat } from "@/lib/game/i18n";
import { sound } from "@/lib/game/sound";
import { useGame } from "@/lib/game/store";
import { cn } from "@/lib/utils";

export function TopicsScreen() {
  const settings = useGame((s) => s.settings);
  const patch = useGame((s) => s.patchSettings);
  const setScreen = useGame((s) => s.setScreen);
  const openHelp = useGame((s) => s.openHelp);
  const lang = settings.language;
  const selected = new Set(settings.selectedCategories);
  const [open, setOpen] = useState(false);

  const toggle = (id: string) => {
    sound.playClick();
    const next = selected.has(id)
      ? settings.selectedCategories.filter((c) => c !== id)
      : [...settings.selectedCategories, id];
    if (next.length === 0) return;
    patch({ selectedCategories: next });
  };

  const summary = settings.selectedCategories.map((id) => tCat(lang, id)).slice(0, 3).join(" · ")
    + (settings.selectedCategories.length > 3 ? ` +${settings.selectedCategories.length - 3}` : "");

  return (
    <ScreenFrame
      header={
        <TopBar
          lang={lang}
          title={t(lang, "selectTopics")}
          step={2}
          onBack={() => setScreen("languages")}
          onHelp={openHelp}
        />
      }
      footer={
        <Button
          size="lg"
          className="w-full"
          onClick={() => {
            sound.playClick();
            setScreen("setup");
          }}
        >
          {t(lang, "nextStep")}
        </Button>
      }
    >
      <div className="space-y-2 py-3">
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1"
            onClick={() => {
              sound.playClick();
              patch({ selectedCategories: [...TOPIC_IDS] });
              setOpen(true);
            }}
          >
            {t(lang, "selectAllTopics")}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex-1"
            onClick={() => {
              sound.playClick();
              patch({ selectedCategories: [TOPIC_IDS[0]] });
            }}
          >
            {t(lang, "clearAllTopics")}
          </Button>
        </div>

        <CollapsedList
          label={t(lang, "selectTopics")}
          summary={summary || String(settings.selectedCategories.length)}
          open={open}
          onToggle={() => {
            sound.playClick();
            setOpen((v) => !v);
          }}
        >
          <div className="grid grid-cols-2 gap-1.5">
            {TOPIC_IDS.map((id) => {
              const on = selected.has(id);
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => toggle(id)}
                  className={cn(
                    "min-h-10 rounded-xl px-3 py-2 text-start text-sm font-medium",
                    on ? "bg-paper text-paper-ink" : "bg-bg-subtle text-fg",
                  )}
                >
                  {tCat(lang, id)}
                </button>
              );
            })}
          </div>
        </CollapsedList>
      </div>
    </ScreenFrame>
  );
}
