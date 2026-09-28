import { create } from "zustand";
import { dreamState, hashString, rerunWithSpec, runPipeline } from "@/lib/blob/pipeline";
import { amorphous, shapeForTemplate } from "@/lib/blob/shapes";
import type { DreamResult, PipelineResult, RegionId, ShapeProgram, Snapshot, Spec } from "@/lib/blob/types";

export type Phase = "idle" | "listening" | "forming" | "settled";

const SNAP_KEY = "sovereign-blob-v1";

function loadPersisted(): { snapshots: Snapshot[]; region: RegionId; utterance: string } {
  if (typeof window === "undefined") return { snapshots: [], region: "au-qld-local", utterance: "" };
  try {
    const raw = window.localStorage.getItem(SNAP_KEY);
    if (!raw) return { snapshots: [], region: "au-qld-local", utterance: "" };
    const p = JSON.parse(raw) as { snapshots?: Snapshot[]; region?: RegionId; utterance?: string };
    return {
      snapshots: p.snapshots ?? [],
      region: p.region ?? "au-qld-local",
      utterance: p.utterance ?? "",
    };
  } catch {
    return { snapshots: [], region: "au-qld-local", utterance: "" };
  }
}

function savePersisted(s: { snapshots: Snapshot[]; region: RegionId; utterance: string }) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SNAP_KEY, JSON.stringify(s));
}

type BlobStore = {
  utterance: string;
  region: RegionId;
  phase: Phase;
  morph: number;
  result: PipelineResult | null;
  dream: DreamResult | null;
  dreaming: boolean;
  snapshots: Snapshot[];
  ageYears: number;
  inspectorOpen: boolean;
  tab: string;
  seed: number;
  startShape: ShapeProgram;
  targetShape: ShapeProgram;
  lastError: string | null;
  hydrated: boolean;
  hydrate: () => void;
  setUtterance: (v: string) => void;
  setRegion: (r: RegionId) => void;
  setPhase: (p: Phase) => void;
  setMorph: (n: number) => void;
  setAgeYears: (n: number) => void;
  setTab: (t: string) => void;
  setInspectorOpen: (v: boolean) => void;
  form: (text?: string) => PipelineResult | null;
  applySpec: (overrides: Partial<Spec>) => void;
  runDream: () => void;
  snapshot: () => void;
  restore: (id: string) => void;
  reset: () => void;
};

const idleStart = amorphous(1);

export const useBlobStore = create<BlobStore>((set, get) => ({
  utterance: "",
  region: "au-qld-local",
  phase: "idle",
  morph: 0,
  result: null,
  dream: null,
  dreaming: false,
  snapshots: [],
  ageYears: 0,
  inspectorOpen: false,
  tab: "reality",
  seed: 1,
  startShape: idleStart,
  targetShape: idleStart,
  lastError: null,
  hydrated: false,
  hydrate: () => {
    if (get().hydrated) return;
    const p = loadPersisted();
    set({ ...p, hydrated: true });
  },
  setUtterance: (v) => {
    set({ utterance: v });
    const { snapshots, region } = get();
    savePersisted({ snapshots, region, utterance: v });
  },
  setRegion: (r) => {
    const { result, utterance, snapshots } = get();
    set({ region: r });
    savePersisted({ snapshots, region: r, utterance });
    if (result) {
      const next = runPipeline(utterance || result.utterance, {
        region: r,
        specOverrides: result.spec,
        existingIntent: result.intent,
      });
      set({
        result: next,
        targetShape: shapeForTemplate(next.intent.template, next.spec),
      });
    }
  },
  setPhase: (p) => set({ phase: p }),
  setMorph: (n) => set({ morph: n }),
  setAgeYears: (n) => set({ ageYears: n }),
  setTab: (t) => set({ tab: t }),
  setInspectorOpen: (v) => set({ inspectorOpen: v }),
  form: (text) => {
    const utterance = (text ?? get().utterance).trim();
    if (!utterance) {
      set({ lastError: "Say or type what you want to make." });
      return null;
    }
    try {
      const result = runPipeline(utterance, { region: get().region });
      const seed = hashString(utterance) || 1;
      set({
        utterance,
        result,
        dream: null,
        lastError: null,
        phase: "forming",
        morph: 0,
        seed,
        startShape: amorphous(seed),
        targetShape: shapeForTemplate(result.intent.template, result.spec),
        inspectorOpen: true,
        ageYears: 0,
      });
      savePersisted({ snapshots: get().snapshots, region: get().region, utterance });
      return result;
    } catch (err) {
      set({ lastError: err instanceof Error ? err.message : "The pipeline failed." });
      return null;
    }
  },
  applySpec: (overrides) => {
    const { result, region } = get();
    if (!result) return;
    const next = rerunWithSpec(result, { ...result.spec, ...overrides }, region);
    set({
      result: next,
      targetShape: shapeForTemplate(next.intent.template, next.spec),
      morph: 1,
      phase: "settled",
    });
  },
  runDream: () => {
    const { utterance, result, region } = get();
    const text = utterance || result?.utterance;
    if (!text) return;
    set({ dreaming: true });
    const { dream } = dreamState(text, { region, specOverrides: result?.spec });
    set({ dream, dreaming: false, tab: "dream" });
  },
  snapshot: () => {
    const { result, snapshots, region, utterance } = get();
    if (!result) return;
    const snap: Snapshot = {
      id: `snap-${Date.now()}`,
      at: Date.now(),
      label: `${result.spec.kind} ${result.spec.widthMm}×${result.spec.heightMm} · ${result.spec.thicknessMm} mm`,
      utterance: result.utterance,
      spec: result.spec,
      score: result.reality.score,
      band: result.reality.band,
    };
    const next = [snap, ...snapshots].slice(0, 24);
    set({ snapshots: next });
    savePersisted({ snapshots: next, region, utterance });
  },
  restore: (id) => {
    const snap = get().snapshots.find((s) => s.id === id);
    if (!snap) return;
    const result = runPipeline(snap.utterance, { region: get().region, specOverrides: snap.spec });
    set({
      utterance: snap.utterance,
      result,
      phase: "settled",
      morph: 1,
      targetShape: shapeForTemplate(result.intent.template, result.spec),
      inspectorOpen: true,
    });
  },
  reset: () =>
    set({
      phase: "idle",
      morph: 0,
      result: null,
      dream: null,
      ageYears: 0,
      inspectorOpen: false,
      startShape: amorphous(1),
      targetShape: amorphous(1),
    }),
}));
