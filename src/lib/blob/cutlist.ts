import { round1, round2 } from "@/lib/utils";
import { alternativesFor, boardMassKg, nearestThickness, resolveMaterial } from "./materials";
import { packSheets } from "./nesting";
import { fastenerCountFor, selectJoinery } from "./joinery";
import { rackingCheck, shelfCheck, tipOverCheck } from "./sag";
import type { CutList, CutPart, KindId, MaterialId, NestResult, Spec } from "./types";

export const DEFAULT_SHEET = { lengthMm: 2440, widthMm: 1220 };

export const DEFAULT_SPEC: Spec = {
  kind: "bookshelf",
  widthMm: 900,
  heightMm: 1800,
  depthMm: 300,
  shelves: 5,
  thicknessMm: 18,
  material: "birch-plywood",
  backPanel: true,
  backThicknessMm: 6,
  plinth: true,
  plinthHeightMm: 80,
  anchored: false,
  loadPerShelfKg: 25,
  joinery: null,
  knockdown: false,
  rearDropMm: 1.5,
  budget: null,
  bayClearMm: 0,
};

export function normaliseSpec(input: Partial<Spec> = {}): Spec {
  const spec: Spec = { ...DEFAULT_SPEC, ...input };
  const material = resolveMaterial(spec.material);
  spec.material = material.id;
  spec.thicknessMm = nearestThickness(material, spec.thicknessMm);
  if (spec.kind === "table") {
    spec.shelves = Math.max(1, Math.round(spec.shelves || 1));
    spec.plinth = false;
    spec.backPanel = false;
  } else {
    spec.shelves = Math.max(2, Math.round(spec.shelves));
  }
  spec.bayClearMm = round1(
    (spec.heightMm - spec.shelves * spec.thicknessMm) / Math.max(1, spec.shelves - 1),
  );
  return spec;
}

function emptyNest(): NestResult {
  return { sheets: [], sheetCount: 0, overallUtilisation: 0, totalPartAreaMm2: 0, unplaced: [], sheet: DEFAULT_SHEET };
}

export function buildCutList(specInput: Partial<Spec>, options: { sheet?: { lengthMm: number; widthMm: number }; kerfMm?: number; creepFactor?: number; ratioDivisor?: number } = {}): CutList {
  const spec = normaliseSpec(specInput);
  if (spec.kind === "table") return buildTableCutList(spec, options);
  return buildCaseCutList(spec, options);
}

function buildCaseCutList(
  spec: Spec,
  options: { sheet?: { lengthMm: number; widthMm: number }; kerfMm?: number; creepFactor?: number; ratioDivisor?: number },
): CutList {
  const material = resolveMaterial(spec.material);
  const sheet = options.sheet || DEFAULT_SHEET;
  const t = spec.thicknessMm;
  const span = spec.widthMm - 2 * t;
  const joinery = selectJoinery({ material, thicknessMm: t, requested: spec.joinery, knockdown: spec.knockdown });

  const parts: CutPart[] = [];
  const push = (p: Omit<CutPart, "grainSensitive"> & { grainSensitive?: boolean }) =>
    parts.push({ grainSensitive: material.grainSensitive, ...p });

  push({
    id: "side-L",
    label: "Side panel, left",
    qty: 1,
    lengthMm: spec.heightMm,
    widthMm: spec.depthMm,
    thicknessMm: t,
    edgesBanded: ["front"],
  });
  push({
    id: "side-R",
    label: "Side panel, right",
    qty: 1,
    lengthMm: spec.heightMm,
    widthMm: spec.depthMm,
    thicknessMm: t,
    edgesBanded: ["front"],
  });
  push({
    id: "shelf",
    label: `Shelf / horizontal panel (span ${span} mm)`,
    qty: spec.shelves,
    lengthMm: span,
    widthMm: spec.depthMm,
    thicknessMm: t,
    edgesBanded: ["front"],
    note: "Grain must run along the span. Do not rotate this part on the sheet.",
  });
  if (spec.plinth) {
    push({
      id: "plinth",
      label: `Front plinth rail (${spec.plinthHeightMm} mm)`,
      qty: 1,
      lengthMm: span,
      widthMm: spec.plinthHeightMm,
      thicknessMm: t,
      edgesBanded: ["top", "bottom"],
      grainSensitive: true,
    });
  }
  if (spec.backPanel) {
    push({
      id: "back",
      label: `Back panel (${spec.backThicknessMm} mm)`,
      qty: 1,
      lengthMm: spec.heightMm,
      widthMm: spec.widthMm,
      thicknessMm: spec.backThicknessMm,
      material: "birch-plywood",
      edgesBanded: [],
      grainSensitive: false,
      separateSheet: true,
    });
  }

  const carcassParts = parts.filter((p) => !p.separateSheet);
  const backParts = parts.filter((p) => p.separateSheet);
  const carcassNest = packSheets(carcassParts, sheet, { kerfMm: options.kerfMm ?? 0 });
  const backNest = backParts.length
    ? packSheets(backParts, sheet, { kerfMm: options.kerfMm ?? 0 })
    : emptyNest();

  return finishCutList({ spec, material, sheet, span, joinery, parts, carcassNest, backNest, options });
}

function buildTableCutList(
  spec: Spec,
  options: { sheet?: { lengthMm: number; widthMm: number }; kerfMm?: number; creepFactor?: number; ratioDivisor?: number },
): CutList {
  const material = resolveMaterial(spec.material);
  const sheet = options.sheet || DEFAULT_SHEET;
  const t = spec.thicknessMm;
  const leg = Math.max(40, Math.min(90, Math.round(spec.depthMm * 0.1)));
  const joinery = selectJoinery({ material, thicknessMm: t, requested: spec.joinery, knockdown: spec.knockdown });
  const span = spec.widthMm - 2 * leg;

  const parts: CutPart[] = [
    {
      id: "top",
      label: "Table top",
      qty: 1,
      lengthMm: spec.widthMm,
      widthMm: spec.depthMm,
      thicknessMm: t,
      edgesBanded: ["all"],
      grainSensitive: material.grainSensitive,
      note: "Grain along the long dimension.",
    },
    {
      id: "leg",
      label: `Leg ${leg} × ${leg}`,
      qty: 4,
      lengthMm: spec.heightMm - t,
      widthMm: leg,
      thicknessMm: t,
      edgesBanded: [],
      grainSensitive: true,
    },
    {
      id: "apron-long",
      label: "Long apron",
      qty: 2,
      lengthMm: spec.widthMm - 2 * leg,
      widthMm: 90,
      thicknessMm: t,
      edgesBanded: ["bottom"],
      grainSensitive: true,
    },
    {
      id: "apron-short",
      label: "Short apron",
      qty: 2,
      lengthMm: spec.depthMm - 2 * leg,
      widthMm: 90,
      thicknessMm: t,
      edgesBanded: ["bottom"],
      grainSensitive: true,
    },
  ];

  const carcassNest = packSheets(parts, sheet, { kerfMm: options.kerfMm ?? 0 });
  return finishCutList({
    spec,
    material,
    sheet,
    span,
    joinery,
    parts,
    carcassNest,
    backNest: emptyNest(),
    options,
    depthForSag: spec.depthMm,
  });
}

function finishCutList({
  spec,
  material,
  sheet,
  span,
  joinery,
  parts,
  carcassNest,
  backNest,
  options,
  depthForSag,
}: {
  spec: Spec;
  material: ReturnType<typeof resolveMaterial>;
  sheet: { lengthMm: number; widthMm: number };
  span: number;
  joinery: ReturnType<typeof selectJoinery>;
  parts: CutPart[];
  carcassNest: NestResult;
  backNest: NestResult;
  options: { creepFactor?: number; ratioDivisor?: number };
  depthForSag?: number;
}): CutList {
  const t = spec.thicknessMm;
  const depth = depthForSag ?? spec.depthMm;
  const shelfSelfMassKg = boardMassKg(material, t, depth, span);
  const shelfSelfPerMm = boardMassKg(material, 1, depth, span);
  const check = shelfCheck({
    loadKg: spec.loadPerShelfKg,
    selfMassKg: shelfSelfMassKg,
    spanMm: span,
    material,
    thicknessMm: t,
    depthMm: depth,
    creepFactor: options.creepFactor ?? 2.0,
    ratioDivisor: options.ratioDivisor ?? 360,
  });

  let remedy: CutList["remedy"] = null;
  const thickerOptions = material.thicknessesMm.filter((x) => x > t);
  if (!check.pass && thickerOptions.length) {
    const nextT = Math.min(...thickerOptions);
    const thicker = shelfCheck({
      loadKg: spec.loadPerShelfKg,
      selfMassKg: boardMassKg(material, nextT, depth, span),
      spanMm: span,
      material,
      thicknessMm: nextT,
      depthMm: depth,
    });
    const midRail = shelfCheck({
      loadKg: spec.loadPerShelfKg,
      selfMassKg: shelfSelfMassKg,
      spanMm: span / 2,
      material,
      thicknessMm: t,
      depthMm: depth,
    });
    const deep = shelfCheck({
      loadKg: spec.loadPerShelfKg,
      selfMassKg: boardMassKg(material, t, depth + 50, span),
      spanMm: span,
      material,
      thicknessMm: t,
      depthMm: depth + 50,
    });
    remedy = {
      thickerSheetMm: nextT,
      thickerPasses: thicker.pass,
      thickerDeflectionMm: thicker.longTermMm,
      midRailAtHalfSpanPasses: midRail.pass,
      midRailDeflectionMm: midRail.longTermMm,
      deeperShelfMm: depth + 50,
      deeperShelfPasses: deep.pass,
      deeperShelfDeflectionMm: deep.longTermMm,
    };
  }

  const carcassMassKg = parts.reduce(
    (sum, p) =>
      sum +
      boardMassKg(resolveMaterial((p.material as MaterialId) || spec.material), p.thicknessMm, p.widthMm, p.lengthMm) *
        p.qty,
    0,
  );
  const tipArgs = { massKg: carcassMassKg, depthMm: spec.depthMm, heightMm: spec.heightMm, payloadMassKg: 0 };
  const tipNoDrop = tipOverCheck({ ...tipArgs, rearDropMm: 0 });
  const tip = tipOverCheck({ ...tipArgs, rearDropMm: spec.rearDropMm ?? 0 });
  tip.marginWithoutRearDrop = tipNoDrop.margin;
  tip.marginGain = Math.round((tip.margin - tipNoDrop.margin) * 1000) / 1000;
  const racking = rackingCheck({ hasBackPanel: spec.backPanel, hasBraces: spec.kind === "table" });

  const fastenerLines: { label: string; per: number; count: number }[] = [];
  if (joinery.fastener) {
    const joints =
      spec.kind === "table"
        ? [
            { label: "apron-to-leg joints", lineLength: 90, count: 8 },
            { label: "top-to-apron joints", lineLength: spec.widthMm, count: 2 },
          ]
        : [
            { label: "shelf-to-side joints", lineLength: spec.depthMm, count: spec.shelves * 2 },
            { label: "plinth-to-side joints", lineLength: spec.plinthHeightMm, count: spec.plinth ? 2 : 0 },
          ];
    for (const j of joints) {
      if (!j.count) continue;
      const per = fastenerCountFor(j.lineLength, joinery);
      if (per) fastenerLines.push({ label: j.label, per, count: per * j.count });
    }
  }

  const bandingMm =
    spec.kind === "table"
      ? 2 * (spec.widthMm + spec.depthMm)
      : spec.heightMm * 2 + span * spec.shelves + (spec.plinth ? span * 2 : 0);

  const flags = buildFlags({ spec, material, check, tip, racking, nest: carcassNest, joinery });

  return {
    spec,
    material: {
      id: material.id,
      label: material.label,
      E: material.E,
      densityKgM3: material.density,
      grainSensitive: material.grainSensitive,
      verified: material.verified,
    },
    joinery,
    spanMm: span,
    clearBayMm: spec.bayClearMm,
    parts: parts.map((p) => ({
      ...p,
      massKg: round2(
        boardMassKg(resolveMaterial((p.material as MaterialId) || spec.material), p.thicknessMm, p.widthMm, p.lengthMm) *
          p.qty,
      ),
    })),
    nesting: {
      carcass: { ...carcassNest, sheet },
      back: { ...backNest, sheet },
      sheetCount: carcassNest.sheetCount + backNest.sheetCount,
      carcassSheetCount: carcassNest.sheetCount,
      backSheetCount: backNest.sheetCount,
    },
    checks: {
      shelfDeflection: check,
      shelfSelfMassKg: round2(shelfSelfMassKg),
      shelfSelfMassPerMmKg: shelfSelfPerMm,
      tipOver: tip,
      racking,
    },
    remedy,
    fasteners: fastenerLines,
    edgeBandingMm: Math.round(bandingMm),
    totalMassKg: round2(carcassMassKg),
    flags,
  };
}

function buildFlags({
  spec,
  material,
  check,
  tip,
  racking,
  nest,
  joinery,
}: {
  spec: Spec;
  material: ReturnType<typeof resolveMaterial>;
  check: CutList["checks"]["shelfDeflection"];
  tip: CutList["checks"]["tipOver"];
  racking: CutList["checks"]["racking"];
  nest: NestResult;
  joinery: CutList["joinery"];
}) {
  const flags: CutList["flags"] = [];
  if (!material.verified) {
    flags.push({
      level: "verify",
      code: "unverified-material-data",
      message: `Elastic modulus for ${material.label} is a typical published value, not a supplier datasheet. Confirm E before trusting the deflection margin.`,
    });
  }
  if (!check.pass) {
    flags.push({
      level: "fail",
      code: "shelf-sag",
      message: `A ${spec.widthMm} mm wide unit gives a ${Math.round(spec.widthMm - 2 * spec.thicknessMm)} mm span. At ${spec.thicknessMm} mm ${material.label} with ${spec.loadPerShelfKg} kg load, long-term sag is ${check.longTermMm} mm against a ${check.limitMm} mm limit (${Math.round(check.utilisation * 100)}% of allowance).`,
    });
  }
  if (tip.anchoredRequired && !spec.anchored && spec.kind !== "table") {
    flags.push({
      level: "fail",
      code: "tip-over",
      message: `Unanchored tip-over margin is only ${tip.margin} (needs ≥ 1.0). This unit must be fixed to the wall.`,
    });
  }
  if (!racking.pass) {
    flags.push({ level: "fail", code: "racking", message: racking.action ?? "racking check failed" });
  }
  if (joinery.substituted) {
    flags.push({ level: "warn", code: "joinery-substituted", message: joinery.selectedBecause });
  }
  if (nest.overallUtilisation < 0.5 && nest.sheetCount > 1) {
    flags.push({
      level: "warn",
      code: "low-sheet-yield",
      message: `Only ${Math.round(nest.overallUtilisation * 100)}% of the purchased sheets ends up as parts.`,
    });
  }
  if (nest.unplaced.length) {
    flags.push({ level: "fail", code: "unplaceable-part", message: `${nest.unplaced.length} part(s) do not fit on a sheet.` });
  }
  return flags;
}

export { alternativesFor };
export type { KindId };
