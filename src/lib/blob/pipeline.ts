import { applyModifications, parseIntent } from "./intent";
import { alternativesFor } from "./materials";
import { buildCutList, DEFAULT_SPEC, normaliseSpec } from "./cutlist";
import { costBuild } from "./cost";
import { buildAssemblySequence } from "./assembly";
import { BANDS, exploreVariants, scoreFormStage, scoreReality } from "./reality";
import { elevations, rectilinearPlan } from "./shapes";
import { regionSheet, resolveRegion } from "./data";
import type { Intent, PipelineResult, RegionId, Spec } from "./types";

export function specFromIntent(intent: Intent, overrides: Partial<Spec> = {}): Spec {
  const s = intent.slots;
  let spec: Spec = {
    ...DEFAULT_SPEC,
    kind: intent.kind === "unknown" || intent.kind === "ui" || intent.kind === "concept" || intent.kind === "frame"
      ? "bookshelf"
      : intent.kind,
    widthMm: s.widthMm.value,
    heightMm: s.heightMm.value,
    depthMm: s.depthMm.value,
    shelves: s.shelves.value,
    material: s.material.value,
    thicknessMm: s.thicknessMm.value,
    anchored: s.anchored.value,
    knockdown: s.knockdown.value,
    loadPerShelfKg: s.loadPerShelfKg.value,
    budget: s.budget.value ?? null,
    ...overrides,
  };
  if (intent.modifications?.length) {
    const { spec: modified, applied } = applyModifications(spec, intent.modifications);
    spec = modified;
    spec.appliedModifications = applied;
  }
  return normaliseSpec(spec);
}

export function runPipeline(
  utterance: string,
  options: { region?: RegionId; specOverrides?: Partial<Spec>; existingIntent?: Intent } = {},
): PipelineResult {
  const region = resolveRegion(options.region ?? "au-qld-local");
  const sheet = region ? regionSheet(region) ?? undefined : undefined;
  const intent = options.existingIntent ?? parseIntent(utterance);
  const stages: PipelineResult["stages"] = [];
  const stage = (name: string, score: number, colour: string, note: string, extra: Record<string, unknown> = {}) =>
    stages.push({
      stage: name,
      score,
      band: score >= 80 ? "green" : score >= 60 ? "amber" : "red",
      colour,
      note,
      ...extra,
    });

  stage(
    "intent",
    Math.round(intent.confidence * 100),
    intent.confidence >= 0.6 ? BANDS.green.colour : intent.confidence >= 0.35 ? BANDS.amber.colour : BANDS.red.colour,
    `Parsed “${intent.kind}”. ${Math.round(intent.confidence * 100)}% of slots came from you; the rest are defaults listed as open questions.`,
    { openQuestions: intent.openQuestions.length },
  );

  const spec = specFromIntent(intent, options.specOverrides || {});
  const form = scoreFormStage({ spec });
  stage(
    "form",
    form.score,
    form.colour,
    form.issues.length ? form.issues.join(" ") : "Proportions and fit are plausible.",
    { issues: form.issues },
  );

  const cutList = buildCutList(spec, { sheet });
  const def = cutList.checks.shelfDeflection;
  stage(
    "geometry",
    def.pass ? Math.round(100 - 25 * def.utilisation) : Math.max(0, Math.round(60 - 60 * (def.utilisation - 1))),
    def.pass ? BANDS.green.colour : BANDS.red.colour,
    `Span ${cutList.spanMm} mm. Predicted long-term sag ${def.longTermMm} mm against a ${def.limitMm} mm allowance.`,
    { spanMm: cutList.spanMm, longTermMm: def.longTermMm, limitMm: def.limitMm },
  );

  const alternatives = alternativesFor(cutList.spec.material);
  stage(
    "material",
    def.pass ? 90 : 70,
    def.pass ? BANDS.green.colour : BANDS.amber.colour,
    `${cutList.material.label}. ${cutList.material.verified ? "Stiffness data verified." : "Handbook modulus — not a supplier datasheet."}`,
  );

  const cost = costBuild(cutList, { region: region?.id });
  stage(
    "economics",
    cost.unpriced.length === 0 && !cost.confidence.anyBulkTierPriced ? 95 : cost.unpriced.length <= 1 ? 72 : 60,
    cost.unpriced.length === 0 ? BANDS.green.colour : BANDS.amber.colour,
    `Priced subtotal ${cost.total} ${cost.currency}${cost.unpriced.length ? `, ${cost.unpriced.length} line(s) unpriced` : ""}. Price book as of ${cost.asOf}.`,
  );

  const reality = scoreReality({ spec: cutList.spec, cutList, cost });
  const assembly = buildAssemblySequence(cutList);
  const plan = rectilinearPlan(cutList);
  cutList.plan = plan;
  stage(
    "output",
    reality.score,
    reality.colour,
    reality.issues.length ? reality.issues.join(" ") : "No blocking issues. Package is buildable as drawn.",
    { status: reality.status },
  );

  return {
    utterance,
    intent,
    spec: cutList.spec,
    stages,
    cutList,
    cost,
    assembly,
    reality,
    materialDecision: {
      selected: cutList.material,
      why: cutList.material.verified
        ? "Selected material matches the request and its stiffness data is verified."
        : "Default sheet material for furniture-grade case goods: stiff for its mass, takes fasteners well, widely available in 18 mm.",
      alternatives: alternatives.slice(0, 3),
      note: "Alternatives are ranked by stiffness-to-mass using typical published moduli; cost comes from the vendor price book.",
    },
    plan,
    elevations: elevations(cutList),
    blob: { colour: reality.colour, band: reality.band },
    alternatives,
    openQuestions: intent.openQuestions,
  };
}

export function rerunWithSpec(base: PipelineResult, specOverrides: Partial<Spec>, region: RegionId = "au-qld-local") {
  return runPipeline(base.utterance, { region, specOverrides, existingIntent: base.intent });
}

export function dreamState(utterance: string, options: { region?: RegionId; specOverrides?: Partial<Spec> } = {}) {
  const base = runPipeline(utterance, options);
  const dream = exploreVariants(base.cutList.spec, { region: options.region ?? "au-qld-local" });
  return { base, dream };
}

export function hashString(str: string) {
  let h = 2166136261;
  for (let i = 0; i < String(str).length; i++) {
    h ^= String(str).charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
