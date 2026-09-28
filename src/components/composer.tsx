import { useEffect, useRef, useState } from "react";
import { Mic, Square, Sparkles, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useBlobStore } from "@/lib/store";
import { refineUtterance } from "@/lib/ai";
import { cn } from "@/lib/utils";

const EXAMPLES = [
  "build me a bookshelf, 1800 tall and 900 wide, shelves 300 deep",
  "bookshelf 1800 tall 900 wide, 21 mm ply, anchored to the wall",
  "cheap 4-shelf unit for a small apartment, under $80",
  "child-safe bookshelf from reclaimed timber",
  "a workbench 1800 long, 600 deep, 900 high",
];

type SpeechRec = {
  start: () => void;
  stop: () => void;
  onresult: ((ev: { results: { [i: number]: { [j: number]: { transcript: string } } } }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  lang: string;
  continuous: boolean;
  interimResults: boolean;
};

export function Composer({ aiOn }: { aiOn: boolean }) {
  const utterance = useBlobStore((s) => s.utterance);
  const setUtterance = useBlobStore((s) => s.setUtterance);
  const form = useBlobStore((s) => s.form);
  const setPhase = useBlobStore((s) => s.setPhase);
  const phase = useBlobStore((s) => s.phase);
  const lastError = useBlobStore((s) => s.lastError);
  const [listening, setListening] = useState(false);
  const [refining, setRefining] = useState(false);
  const recRef = useRef<SpeechRec | null>(null);

  useEffect(() => {
    const Ctor =
      (window as unknown as { webkitSpeechRecognition?: new () => SpeechRec; SpeechRecognition?: new () => SpeechRec })
        .SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => SpeechRec }).webkitSpeechRecognition;
    if (!Ctor) return;
    const rec = new Ctor();
    rec.lang = "en-AU";
    rec.continuous = false;
    rec.interimResults = true;
    rec.onresult = (ev) => {
      const text = ev.results[0]?.[0]?.transcript ?? "";
      if (text) setUtterance(text);
    };
    rec.onend = () => {
      setListening(false);
      const text = useBlobStore.getState().utterance;
      if (text.trim()) form(text);
    };
    rec.onerror = () => setListening(false);
    recRef.current = rec;
  }, [form, setUtterance]);

  const toggleMic = () => {
    if (!recRef.current) return;
    if (listening) {
      recRef.current.stop();
      setListening(false);
      setPhase(useBlobStore.getState().result ? "settled" : "idle");
      return;
    }
    setListening(true);
    setPhase("listening");
    recRef.current.start();
  };

  const onRefine = async () => {
    if (!utterance.trim() || !aiOn) return;
    setRefining(true);
    try {
      const out = await refineUtterance({ data: { utterance } });
      if (out.ok && out.text) {
        setUtterance(out.text.trim());
        form(out.text.trim());
      }
    } finally {
      setRefining(false);
    }
  };

  return (
    <div className="pointer-events-auto w-full max-w-3xl">
      <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => {
              setUtterance(ex);
              form(ex);
            }}
            className="shrink-0 rounded-full border border-border bg-surface/80 px-3 py-1.5 text-xs text-muted hover:text-fg"
          >
            {ex.length > 42 ? ex.slice(0, 40) + "…" : ex}
          </button>
        ))}
      </div>
      <div className="rounded-xl border border-border bg-surface/90 p-3 shadow-soft backdrop-blur-sm">
        <Textarea
          value={utterance}
          onChange={(e) => setUtterance(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              form();
            }
          }}
          placeholder="Speak or type an idea — a bookshelf, a bench, a wall of shelves…"
          rows={2}
          className="min-h-16 resize-none border-0 bg-transparent px-1 py-1"
        />
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="blob"
            onClick={() => form()}
            disabled={phase === "forming"}
          >
            <Wand2 />
            Form it
          </Button>
          <Button
            type="button"
            variant={listening ? "default" : "ghost"}
            onClick={toggleMic}
            aria-pressed={listening}
            className={cn(listening && "bg-blocked text-bg")}
          >
            {listening ? <Square /> : <Mic />}
            {listening ? "Stop" : "Speak"}
          </Button>
          {aiOn && (
            <Button type="button" variant="ghost" onClick={onRefine} disabled={refining || !utterance.trim()}>
              <Sparkles />
              {refining ? "Listening deeper" : "Listen deeper"}
            </Button>
          )}
          {lastError && <p className="text-xs text-blocked">{lastError}</p>}
        </div>
      </div>
    </div>
  );
}
