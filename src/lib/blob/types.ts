export type SlotSource = "user" | "default" | "absent";

export type Slot<T> = { value: T; source: SlotSource };

export type KindId = "bookshelf" | "table" | "frame" | "ui" | "concept" | "unknown";

export type JoineryId = "pocket-screw" | "confirmat" | "dado" | "dowel" | "cam" | "none";

export type RealityBand = "green" | "amber" | "red";

export type RegionId = "au-qld-local" | "cn-bulk";

export type MaterialId =
  | "birch-plywood"
  | "poplar-plywood"
  | "mdf"
  | "solid-pine"
  | "bamboo"
  | "steel-mild"
  | "aluminium";

export type MetaballNode = {
  x: number;
  y: number;
  r: number;
  w: number;
};

export type ShapeProgram = {
  kind: string;
  nodes: MetaballNode[];
  seed?: number;
  progress?: number;
};

export type Spec = {
  kind: KindId;
  widthMm: number;
  heightMm: number;
  depthMm: number;
  shelves: number;
  thicknessMm: number;
  material: MaterialId;
  backPanel: boolean;
  backThicknessMm: number;
  plinth: boolean;
  plinthHeightMm: number;
  anchored: boolean;
  loadPerShelfKg: number;
  joinery: JoineryId | null;
  knockdown: boolean;
  rearDropMm: number;
  budget: number | null;
  bayClearMm: number;
  appliedModifications?: string[];
};

export type Material = {
  id: MaterialId;
  label: string;
  E: number;
  density: number;
  thicknessesMm: number[];
  verified: boolean;
  source: string | null;
  provenance: string;
  grainSensitive: boolean;
  notes: string;
};

export type ShelfCheck = {
  immediateMm: number;
  longTermMm: number;
  limitMm: number;
  utilisation: number;
  pass: boolean;
  I: number;
  spanRatio: number;
  totalLoadKg: number;
};

export type TipOverCheck = {
  overturningMomentNm: number;
  restoringMomentNm: number;
  margin: number;
  rearDropMm: number;
  tiltDeg: number;
  comShiftMm: number;
  pass: boolean;
  anchoredRequired: boolean;
  marginWithoutRearDrop?: number;
  marginGain?: number;
};

export type CutPart = {
  id: string;
  label: string;
  qty: number;
  lengthMm: number;
  widthMm: number;
  thicknessMm: number;
  edgesBanded: string[];
  grainSensitive: boolean;
  note?: string;
  material?: string;
  separateSheet?: boolean;
  massKg?: number;
};

export type NestedPart = {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  lengthMm: number;
  widthMm: number;
  rotated: boolean;
};

export type NestedSheet = {
  index: number;
  parts: NestedPart[];
  usedAreaMm2: number;
  utilisation: number;
};

export type NestResult = {
  sheet: { lengthMm: number; widthMm: number };
  sheets: NestedSheet[];
  sheetCount: number;
  totalPartAreaMm2: number;
  overallUtilisation: number;
  unplaced: unknown[];
};

export type Joinery = {
  id: JoineryId | "none";
  label: string;
  needsThicknessMm?: number;
  suits?: string[];
  tooling?: string[];
  fastener?: { id: string; label: string; lengthMm: number | null };
  spacingMm?: number | null;
  edgeDistanceMm?: number | null;
  reason?: string;
  selectedBecause: string;
  substituted: boolean;
  requested?: string;
};

export type CostLine = {
  key: string;
  label: string;
  qty: number;
  unit?: string;
  unitPrice: number;
  currency: string;
  lineTotal: number;
  basis: string;
  moq: number | null;
  supplier?: string | null;
  listing?: string | null;
  url?: string | null;
  asOf: string;
  basisMismatch: boolean;
  role: string;
  note?: string;
};

export type CostResult = {
  asOf: string;
  currency: string;
  region: {
    id: string;
    label: string;
    supplyMode: string;
    sheetMm: { lengthMm: number; widthMm: number };
    freightModelled: boolean;
    cutServiceIncluded: boolean;
  } | null;
  lines: CostLine[];
  tools: CostLine[];
  total: number;
  tax: { label: string; rate: number; amount: number } | null;
  toolTotal: number;
  otherCurrency: CostLine[];
  unpriced: { key: string; qty: number; role: string; label: string; reason: string; url?: string }[];
  confidence: {
    pricedLines: number;
    unpricedLines: number;
    anyBulkTierPriced: boolean;
    note: string;
  };
};

export type PlanRect = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  kind: "side" | "shelf" | "plinth" | "top" | "leg" | "apron" | "back";
};

export type Plan = {
  kind: "plan";
  units: "mm";
  widthMm: number;
  heightMm: number;
  depthMm?: number;
  rects: PlanRect[];
};

export type Intent = {
  utterance: string;
  kind: KindId;
  template: string;
  location: "current_view" | "wall" | "unspecified";
  slots: {
    widthMm: Slot<number>;
    heightMm: Slot<number>;
    depthMm: Slot<number>;
    shelves: Slot<number>;
    material: Slot<MaterialId>;
    budget: Slot<number | null>;
    anchored: Slot<boolean>;
    knockdown: Slot<boolean>;
    loadPerShelfKg: Slot<number>;
    thicknessMm: Slot<number>;
  };
  priorities: Record<string, number>;
  constraints: Record<string, { active: boolean; label: string }>;
  modifications: { slot: string | null; delta?: number; qualitative?: string; intent?: string }[];
  confidence: number;
  openQuestions: { slot: string; assumed: unknown; question: string }[];
  recognised: { dimensions: string[]; budgetRaw: string | null };
  graph: string;
};

export type RealityResult = {
  stage: string;
  complete: boolean;
  dimensions: Record<string, number | null>;
  weights?: Record<string, number>;
  score: number;
  band: RealityBand;
  colour: string;
  issues: string[];
  mitigations: string[];
  cnc?: { pathLengthMm: number; estimatedMinutes: number; feedRateMmPerMin: number };
  status: "PASS" | "REVIEW" | "FAIL";
  caveat?: string;
};

export type PipelineStage = {
  stage: string;
  score: number;
  band: RealityBand;
  colour: string;
  note: string;
  [k: string]: unknown;
};

export type CutList = {
  spec: Spec;
  material: {
    id: MaterialId;
    label: string;
    E: number;
    densityKgM3: number;
    grainSensitive: boolean;
    verified: boolean;
  };
  joinery: Joinery;
  spanMm: number;
  clearBayMm: number;
  parts: CutPart[];
  nesting: {
    carcass: NestResult;
    back: NestResult;
    sheetCount: number;
    carcassSheetCount: number;
    backSheetCount: number;
  };
  checks: {
    shelfDeflection: ShelfCheck;
    shelfSelfMassKg: number;
    shelfSelfMassPerMmKg: number;
    tipOver: TipOverCheck;
    racking: { pass: boolean; mechanism: string; action?: string };
  };
  remedy: {
    thickerSheetMm: number;
    thickerPasses: boolean;
    thickerDeflectionMm: number;
    midRailAtHalfSpanPasses: boolean;
    midRailDeflectionMm: number;
    deeperShelfMm: number;
    deeperShelfPasses: boolean;
    deeperShelfDeflectionMm: number;
  } | null;
  fasteners: { label: string; per: number; count: number }[];
  edgeBandingMm: number;
  totalMassKg: number;
  flags: { level: string; code: string; message: string }[];
  plan?: Plan;
};

export type Assembly = {
  steps: { step: number; title: string; detail: string; reason: string; tools: string[] }[];
  stepCount: number;
};

export type DreamResult = {
  explored: number;
  recommended: { change: Record<string, unknown>; score: number; band: RealityBand; total: number | null; currency: string | null } | null;
  best: { change: Record<string, unknown>; score: number; band: RealityBand; total: number | null; currency: string | null }[];
  worst: { change: Record<string, unknown>; score: number; band: RealityBand; total: number | null; currency: string | null }[];
  note: string;
};

export type Snapshot = {
  id: string;
  at: number;
  label: string;
  utterance: string;
  spec: Spec;
  score: number;
  band: RealityBand;
};

export type PipelineResult = {
  utterance: string;
  intent: Intent;
  spec: Spec;
  stages: PipelineStage[];
  cutList: CutList;
  cost: CostResult;
  assembly: Assembly;
  reality: RealityResult;
  materialDecision: {
    selected: CutList["material"];
    why: string;
    alternatives: { id: string; label: string; stiffnessVsPrimary: number; massVsPrimary: number; reason: string }[];
    note: string;
  };
  plan: Plan;
  elevations: {
    front: { widthMm: number; heightMm: number; shelfYs: number[]; thicknessMm: number };
    side: { widthMm: number; heightMm: number; shelfYs: number[]; thicknessMm: number };
    clearBaysMm: number[];
  };
  blob: { colour: string; band: RealityBand };
  alternatives: { id: string; label: string; stiffnessVsPrimary: number; massVsPrimary: number; reason: string }[];
  openQuestions: Intent["openQuestions"];
};
