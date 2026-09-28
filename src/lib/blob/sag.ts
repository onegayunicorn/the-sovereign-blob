import { round3 } from "@/lib/utils";
import type { Material, ShelfCheck, TipOverCheck } from "./types";

export const GRAVITY = 9.81;

export function secondMomentOfArea(depthMm: number, thicknessMm: number) {
  return (depthMm * Math.pow(thicknessMm, 3)) / 12;
}

export function lineLoadNPerMm(totalKg: number, spanMm: number) {
  return (totalKg * GRAVITY) / spanMm;
}

export function immediateDeflectionMm({
  loadKg,
  spanMm,
  E,
  depthMm,
  thicknessMm,
}: {
  loadKg: number;
  spanMm: number;
  E: number;
  depthMm: number;
  thicknessMm: number;
}) {
  const I = secondMomentOfArea(depthMm, thicknessMm);
  const w = lineLoadNPerMm(loadKg, spanMm);
  return (5 * w * Math.pow(spanMm, 4)) / (384 * E * I);
}

export function shelfCheck({
  loadKg,
  selfMassKg = 0,
  spanMm,
  material,
  thicknessMm,
  depthMm,
  creepFactor = 2.0,
  ratioDivisor = 360,
}: {
  loadKg: number;
  selfMassKg?: number;
  spanMm: number;
  material: Pick<Material, "E">;
  thicknessMm: number;
  depthMm: number;
  creepFactor?: number;
  ratioDivisor?: number;
}): ShelfCheck {
  const totalKg = loadKg + selfMassKg;
  const immediateMm = immediateDeflectionMm({
    loadKg: totalKg,
    spanMm,
    E: material.E,
    depthMm,
    thicknessMm,
  });
  const longTermMm = immediateMm * creepFactor;
  const limitMm = spanMm / ratioDivisor;
  const utilisation = longTermMm / limitMm;
  return {
    immediateMm: round3(immediateMm),
    longTermMm: round3(longTermMm),
    limitMm: round3(limitMm),
    utilisation: round3(utilisation),
    pass: utilisation <= 1,
    I: Math.round(secondMomentOfArea(depthMm, thicknessMm)),
    spanRatio: Math.round(spanMm / (longTermMm || 1e-9)),
    totalLoadKg: round3(totalKg),
  };
}

export function minimumThickness({
  availableThicknessesMm,
  loadKg,
  selfMassPerMmThicknessKg,
  spanMm,
  material,
  depthMm,
  creepFactor = 2.0,
  ratioDivisor = 360,
}: {
  availableThicknessesMm: number[];
  loadKg: number;
  selfMassPerMmThicknessKg: number;
  spanMm: number;
  material: Pick<Material, "E">;
  depthMm: number;
  creepFactor?: number;
  ratioDivisor?: number;
}) {
  const sorted = [...availableThicknessesMm].sort((a, b) => a - b);
  for (const t of sorted) {
    const selfMassKg = selfMassPerMmThicknessKg * t;
    const check = shelfCheck({
      loadKg,
      selfMassKg,
      spanMm,
      material,
      thicknessMm: t,
      depthMm,
      creepFactor,
      ratioDivisor,
    });
    if (check.pass) return { thicknessMm: t, check };
  }
  return null;
}

export function tipOverCheck({
  massKg,
  depthMm,
  heightMm,
  pushForceN = 200,
  payloadMassKg = 0,
  payloadHeightMm = null,
  rearDropMm = 0,
}: {
  massKg: number;
  depthMm: number;
  heightMm: number;
  pushForceN?: number;
  payloadMassKg?: number;
  payloadHeightMm?: number | null;
  rearDropMm?: number;
}): TipOverCheck {
  const pushHeight = payloadHeightMm ?? heightMm * 0.9;
  const tiltRad = rearDropMm > 0 ? Math.atan(rearDropMm / depthMm) : 0;
  const comHeightMm = heightMm / 2;
  const comShiftMm = rearDropMm > 0 ? comHeightMm * Math.sin(tiltRad) : 0;
  const overturningMoment = pushForceN * (pushHeight / 1000);
  const restoringMoment =
    (massKg + payloadMassKg) * GRAVITY * (depthMm / 1000 / 2 + comShiftMm / 1000);
  const margin = restoringMoment / overturningMoment;
  return {
    overturningMomentNm: round3(overturningMoment),
    restoringMomentNm: round3(restoringMoment),
    margin: round3(margin),
    rearDropMm,
    tiltDeg: round3((tiltRad * 180) / Math.PI),
    comShiftMm: round3(comShiftMm),
    pass: margin >= 1,
    anchoredRequired: margin < 1,
  };
}

export function rackingCheck({ hasBackPanel, hasBraces }: { hasBackPanel: boolean; hasBraces: boolean }) {
  if (hasBackPanel) return { pass: true, mechanism: "fixed back panel acts as a shear diaphragm" };
  if (hasBraces) return { pass: true, mechanism: "diagonal braces" };
  return {
    pass: false,
    mechanism: "none",
    action: "add a fixed back panel or diagonal braces; unsupported rectangular boxes rack under load",
  };
}

/** Visual sag at year T using the same creep model (K grows from 1 toward 2). */
export function agedSagMm(immediateMm: number, years: number) {
  const k = 1 + Math.min(1, years / 10);
  return round3(immediateMm * k);
}
