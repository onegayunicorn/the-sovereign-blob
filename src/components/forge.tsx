import { useEffect, useState } from "react";
import { PanelRight } from "lucide-react";
import { BlobCanvas } from "@/components/blob-canvas";
import { Composer } from "@/components/composer";
import { Inspector } from "@/components/inspector";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useBlobStore } from "@/lib/store";
import { aiStatus } from "@/lib/ai";
import type { RealityBand } from "@/lib/blob/types";

function bandTone(band?: RealityBand) {
  if (band === "green") return "ready" as const;
  if (band === "amber") return "caution" as const;
  if (band === "red") return "blocked" as const;
  return "default" as const;
}

export function Forge() {
  const phase = useBlobStore((s) => s.phase);
  const result = useBlobStore((s) => s.result);
  const inspectorOpen = useBlobStore((s) => s.inspectorOpen);
  const setInspectorOpen = useBlobStore((s) => s.setInspectorOpen);
  const hydrate = useBlobStore((s) => s.hydrate);
  const [aiOn, setAiOn] = useState(false);

  useEffect(() => {
    hydrate();
    aiStatus().then((s) => setAiOn(s.available)).catch(() => setAiOn(false));
  }, [hydrate]);

  const score = result?.reality.score;
  const band = result?.reality.band;

  return (
    <div className="relative isolate flex min-h-dvh flex-col bg-bg text-fg">
      <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between p-4 md:p-6">
        <div className="pointer-events-auto">
          <p className="font-display text-2xl leading-none md:text-3xl">Sovereign Blob</p>
          <p className="mt-1 max-w-xs text-xs text-muted md:text-sm">
            Imagination, compiled against physics.
          </p>
        </div>
        <div className="pointer-events-auto flex items-center gap-2">
          {score != null && (
            <Badge tone={bandTone(band)} className="tabular">
              {score} · {result?.reality.status}
            </Badge>
          )}
          {phase === "listening" && <Badge tone="blob">Listening</Badge>}
          {phase === "forming" && <Badge tone="blob">Forming</Badge>}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Open inspector"
            onClick={() => setInspectorOpen(true)}
          >
            <PanelRight />
          </Button>
        </div>
      </header>

      <div className="flex min-h-dvh flex-1">
        <div className="relative min-h-dvh min-w-0 flex-1">
          <BlobCanvas />
          {phase === "idle" && !result && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-6">
              <p className="max-w-md text-center font-display text-3xl leading-tight text-fg/90 md:text-5xl">
                Say a thing.
                <span className="mt-3 block font-sans text-sm font-normal tracking-normal text-muted md:text-base">
                  A bookshelf. A bench. A wall of shelves. The blob will form it, then refuse it if it cannot exist.
                </span>
              </p>
            </div>
          )}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center px-3 pb-[max(1rem,env(safe-area-inset-bottom))] pt-16 md:px-6">
            <Composer aiOn={aiOn} />
          </div>
        </div>

        <aside className="hidden w-[26rem] shrink-0 border-l border-border bg-surface lg:flex lg:flex-col">
          <Inspector aiOn={aiOn} />
        </aside>
      </div>

      <Sheet open={inspectorOpen} onOpenChange={setInspectorOpen}>
        <SheetContent side="bottom" title="Design inspector" className="lg:hidden">
          <div className="h-[72vh] min-h-0 overflow-hidden">
            <Inspector aiOn={aiOn} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
