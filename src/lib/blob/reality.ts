import { clamp } from "@/lib/utils";
import { buildCutList } from "./cutlist";
import { costBuild } from "./cost";
import { regionSheet, resolveRegion } from "./data";
import type { CostResult, CutList, DreamResult, RealityBand, RealityResult, RegionId, Spec } from "./types";

export const BANDS: Record<RealityBand, { min: number; colour: string; label: string }> = {
  green: { min: 80, colour: "#5eead4", label: "buildable as drawn" },
  amber: { min: 60, colour: "#e8b86d", label: "buildable with mitigations" },
  red: { min: 0, colour: "#e07a73", label: "do not build as drawn" },
};

export const WEIGHTS = {
  physics: 0.3,
  safety: 0.25,
  manufacturability: 0.15,
  cost: 0.15,
  complexity: 0.1,
  energy: 0.05,
};

function bandOf(score: number): RealityBand {
  if (score >= BANDS.green.min) return "green";
  if (score >= BANDS.amber.min) return "amber";
  return "red";
}

export function scoreFormStage({ spec }: { spec: Spec }): RealityResult {
  const issues: string[] = [];
  let s = 100;
  const aspect = spec.heightMm / spec.widthMm;
  if (aspect > 4) {
    issues.push(`height/width ratio ${aspect.toFixed(2)} is very tall and narrow — unstable before it is even built`);
    s -= 25;
  }
  if (spec.kind !== "table") {
    if (spec.bayClearMm > 450) {
      issues.push(`clear bay of ${spec.bayClearMm} mm is taller than a standard book; you are paying for air`);
      s -= 10;
    }
    if (spec.bayClearMm < 180) {
      issues.push(`clear bay of ${spec.bayClearMm} mm will not take a hardback`);
      s -= 15;
    }
    if (spec.depthMm < 200) {
      issues.push(`depth ${spec.depthMm} mm is shallower than most art books`);
      s -= 10;
    }
  }
  const score = clamp(s);
  const band = bandOf(score);
  return {
    stage: "form",
    complete: false,
    score,
    band,
    colour: BANDS[band].colour,
    dimensions: { physics: null, safety: null, manufacturability: null, cost: null, complexity: null, energy: null },
    issues,
    mitigations: [],
    status: score >= 80 ? "PASS" : score >= 60 ? "REVIEW" : "FAIL",
    caveat: "Structural and cost dimensions are not yet computed; this score only reflects proportions and fit.",
  };
}

export function scoreReality({ spec, cutList, cost }: { spec: Spec; cutList: CutList; cost: CostResult }): RealityResult {
  const dimensions: Record<string, number> = {};
  const issues: string[] = [];
  const mitigations: string[] = [];

  const def = cutList.checks.shelfDeflection;
  let sagScore: number;
  if (def.pass) sagScore = clamp(100 - 25 * def.utilisation);
  else {
    sagScore = clamp(60 - 60 * (def.utilisation - 1));
    issues.push(
      `Shelf sag: ${def.longTermMm} mm predicted long-term against a ${def.limitMm} mm allowance (${Math.round(def.utilisation * 100)}%).`,
    );
    if (cutList.remedy) {
      if (cutList.remedy.thickerPasses) {
        mitigations.push(
          `Use ${cutList.remedy.thickerSheetMm} mm stock — predicted sag drops to ${cutList.remedy.thickerDeflectionMm} mm.`,
        );
      }
      if (cutList.remedy.midRailAtHalfSpanPasses) {
        mitigations.push(
          `Add a mid-rail or centre divider: halving the span drops predicted sag to ${cutList.remedy.midRailDeflectionMm} mm without changing material.`,
        );
      }
      if (cutList.remedy.deeperShelfPasses) {
        mitigations.push(
          `Increase shelf depth to ${cutList.remedy.deeperShelfMm} mm — sag ${cutList.remedy.deeperShelfDeflectionMm} mm.`,
        );
      }
    }
  }

  const tip = cutList.checks.tipOver;
  const tipScore = tip.pass ? clamp(70 + 30 * Math.min(1, tip.margin - 1)) : clamp(tip.margin * 100);
  const rack = cutList.checks.racking;
  const rackScore = rack.pass ? 100 : 40;
  if (!rack.pass) issues.push(`Racking: ${rack.action}`);
  dimensions.physics = Math.round(0.5 * sagScore + 0.3 * tipScore + 0.2 * rackScore);

  let safety = 100;
  if (spec.kind !== "table" && tip.anchoredRequired && !spec.anchored) {
    safety -= 35;
    issues.push(
      `Tip-over margin ${tip.margin} with no wall fixing. This is the leading furniture injury mechanism in homes with children.`,
    );
    mitigations.push("Fix the unit to the wall (studs, or rated hollow-wall anchors).");
  }
  if (spec.widthMm >= 600 && spec.heightMm >= 1200 && !spec.anchored && spec.kind !== "table") safety -= 10;
  if (spec.loadPerShelfKg > 40) {
    safety -= 10;
    issues.push(`${spec.loadPerShelfKg} kg per shelf is above a normal domestic book load (25 kg).`);
  }
  dimensions.safety = clamp(safety);

  const yieldPct = cutList.nesting.carcass.overallUtilisation;
  let mfg = yieldPct >= 0.65 ? 100 : yieldPct >= 0.5 ? 88 : yieldPct >= 0.4 ? 72 : 55;
  if (cutList.nesting.carcass.unplaced.length) {
    mfg = 0;
    issues.push("At least one part does not fit on a standard sheet at any rotation.");
  }
  if (cutList.nesting.carcassSheetCount > 1) {
    mfg -= 5;
    mitigations.push(
      `Two sheets are required at ${Math.round(yieldPct * 100)}% yield — the grain constraint forces the orientation.`,
    );
  }
  dimensions.manufacturability = clamp(mfg);

  if (spec.budget) {
    const ratio = cost.total / spec.budget;
    dimensions.cost = clamp(ratio <= 0.8 ? 100 : ratio <= 1 ? 90 - (ratio - 0.8) * 100 : 82 - (ratio - 1) * 200);
    if (ratio > 1) {
      issues.push(`Priced subtotal ${cost.total} ${cost.currency} is over the ${spec.budget} ${cost.currency} budget.`);
      mitigations.push("Switch the joinery to dowels, drop the back panel to 3 mm, or reduce shelf count.");
    }
  } else {
    const unpricedPenalty = cost.unpriced.length * 8;
    const mismatchPenalty = cost.lines.filter((l) => l.basisMismatch).length * 12;
    dimensions.cost = clamp(100 - unpricedPenalty - mismatchPenalty, 40, 100);
    if (cost.unpriced.length) {
      issues.push(`${cost.unpriced.length} line(s) in the bill of materials have no verified price.`);
    }
    const mismatched = cost.lines.filter((l) => l.basisMismatch);
    if (mismatched.length) {
      issues.push(`${mismatched.length} line(s) are priced at a bulk MOQ tier you cannot buy at for one build.`);
    }
  }

  const partCount = cutList.parts.reduce((s, p) => s + p.qty, 0);
  let complexity = clamp(100 - Math.max(0, partCount - 8) * 3);
  const jointCount = cutList.fasteners.reduce((s, f) => s + f.count, 0);
  if (jointCount > 60) complexity -= 10;
  if (cutList.joinery.substituted) complexity -= 5;
  dimensions.complexity = clamp(complexity);

  const pathMm = cutList.nesting.carcass.sheets.reduce(
    (s, sheet) => s + sheet.parts.reduce((a, p) => a + 2 * (p.lengthMm + p.widthMm), 0),
    0,
  );
  const cncMinutes = Math.round((pathMm / 3000) * 10) / 10;
  dimensions.energy = clamp(100 - Math.max(0, cncMinutes - 20) * 0.5);

  const combined = Math.round(
    Object.entries(WEIGHTS).reduce((sum, [k, w]) => sum + (dimensions[k] ?? 0) * w, 0),
  );
  const score = clamp(combined);
  const band = bandOf(score);

  return {
    stage: "full",
    complete: true,
    dimensions,
    weights: WEIGHTS,
    score,
    band,
    colour: BANDS[band].colour,
    issues,
    mitigations,
    cnc: { pathLengthMm: Math.round(pathMm), estimatedMinutes: cncMinutes, feedRateMmPerMin: 3000 },
    status: score >= 80 ? "PASS" : score >= 60 ? "REVIEW" : "FAIL",
  };
}

export function exploreVariants(
  spec: Spec,
  options: { maxVariants?: number; region?: RegionId | null } = {},
): DreamResult {
  const region = resolveRegion(options.region ?? null);
  const sheet = region ? regionSheet(region) ?? undefined : undefined;
  const maxVariants = options.maxVariants ?? 12;
  const dimensions: { key: keyof Spec; values: unknown[] }[] = [
    { key: "thicknessMm", values: [15, 18, 21, 25] },
    { key: "shelves", values: [spec.shelves - 1, spec.shelves, spec.shelves + 1] },
    { key: "depthMm", values: [250, 300, 350] },
    { key: "joinery", values: ["pocket-screw", "dado", "dowel"] },
    { key: "backPanel", values: [true, false] },
    { key: "anchored", values: [true] },
  ];

  const results: DreamResult["best"] = [];
  for (const d of dimensions) {
    for (const value of d.values) {
      if (value === spec[d.key]) continue;
      if (d.key === "shelves" && typeof value === "number" && value < 2 && spec.kind !== "table") continue;
      const variantSpec = { ...spec, [d.key]: value } as Spec;
      try {
        const cutList = buildCutList(variantSpec, { sheet });
        const cost = costBuild(cutList, { region: options.region });
        const scored = scoreReality({ spec: cutList.spec, cutList, cost });
        results.push({
          change: { [d.key]: value },
          score: scored.score,
          band: scored.band,
          total: cost.total,
          currency: cost.currency,
        });
      } catch {
        /* skip illegal variants */
      }
      if (results.length >= maxVariants) break;
    }
    if (results.length >= maxVariants) break;
  }
  results.sort((a, b) => b.score - a.score);
  return {
    explored: results.length,
    recommended: results[0] ?? null,
    best: results.slice(0, 3),
    worst: results.slice(-1),
    note: "Each variant is a full recomputation of geometry, load check and cost. Nothing is proposed without being checked.",
  };
}
