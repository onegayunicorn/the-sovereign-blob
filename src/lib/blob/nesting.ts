import type { CutPart, NestResult, NestedSheet } from "./types";

type Rect = { x: number; y: number; w: number; h: number };

function overlaps(a: Rect, b: Rect) {
  return !(a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.h <= b.y || b.y + b.h <= a.y);
}

function splitFree(existing: Rect[], used: Rect) {
  const out: Rect[] = [];
  for (const f of existing) {
    if (!overlaps(f, used)) {
      out.push(f);
      continue;
    }
    if (used.x > f.x) out.push({ x: f.x, y: f.y, w: used.x - f.x, h: f.h });
    if (used.x + used.w < f.x + f.w) {
      out.push({ x: used.x + used.w, y: f.y, w: f.x + f.w - (used.x + used.w), h: f.h });
    }
    if (used.y > f.y) out.push({ x: f.x, y: f.y, w: f.w, h: used.y - f.y });
    if (used.y + used.h < f.y + f.h) {
      out.push({ x: f.x, y: used.y + used.h, w: f.w, h: f.y + f.h - (used.y + used.h) });
    }
  }
  return out.filter(
    (r, i) =>
      r.w > 0.001 &&
      r.h > 0.001 &&
      !out.some(
        (o, j) =>
          i !== j && o.x <= r.x && o.y <= r.y && o.x + o.w >= r.x + r.w && o.y + o.h >= r.y + r.h,
      ),
  );
}

function tryFit(freeRects: Rect[], w: number, h: number) {
  let best: { rect: Rect; w: number; h: number; score: [number, number] } | null = null;
  for (const r of freeRects) {
    if (r.w + 0.001 >= w && r.h + 0.001 >= h) {
      const leftoverShort = Math.min(r.w - w, r.h - h);
      const leftoverLong = Math.max(r.w - w, r.h - h);
      const score: [number, number] = [leftoverShort, leftoverLong];
      if (!best || score[0] < best.score[0] || (score[0] === best.score[0] && score[1] < best.score[1])) {
        best = { rect: r, w, h, score };
      }
    }
  }
  return best;
}

type Expanded = {
  id: string;
  label: string;
  thicknessMm: number;
  w: number;
  h: number;
  realLengthMm: number;
  realWidthMm: number;
  grainSensitive: boolean;
};

type SheetState = {
  index: number;
  freeRects: Rect[];
  placed: (Expanded & { x: number; y: number; placedW: number; placedH: number; rotated: boolean })[];
};

function attemptPlace(sheetState: SheetState, part: Expanded) {
  const orientations = part.grainSensitive ? [[part.w, part.h]] : [[part.w, part.h], [part.h, part.w]];
  let best: { fit: NonNullable<ReturnType<typeof tryFit>>; w: number; h: number } | null = null;
  for (const [w, h] of orientations) {
    const fit = tryFit(sheetState.freeRects, w, h);
    if (fit && (!best || fit.score[0] < best.fit.score[0])) best = { fit, w, h };
  }
  if (!best) return false;
  const { rect } = best.fit;
  const placedRect = { x: rect.x, y: rect.y, w: best.w, h: best.h };
  sheetState.freeRects = splitFree(sheetState.freeRects, placedRect);
  sheetState.placed.push({
    ...part,
    x: rect.x,
    y: rect.y,
    placedW: best.w,
    placedH: best.h,
    rotated: best.w !== part.w,
  });
  return true;
}

export function packSheets(
  parts: CutPart[],
  sheet: { lengthMm: number; widthMm: number },
  options: { kerfMm?: number } = {},
): NestResult {
  const kerf = options.kerfMm ?? 0;
  const expanded: Expanded[] = [];
  for (const p of parts) {
    const qty = p.qty ?? 1;
    for (let i = 0; i < qty; i++) {
      expanded.push({
        id: `${p.id}#${i + 1}`,
        label: p.label,
        thicknessMm: p.thicknessMm,
        w: p.lengthMm + kerf,
        h: p.widthMm + kerf,
        realLengthMm: p.lengthMm,
        realWidthMm: p.widthMm,
        grainSensitive: !!p.grainSensitive,
      });
    }
  }
  expanded.sort((a, b) => b.w * b.h - a.w * a.h);

  const sheets: SheetState[] = [];
  const unplaced: Expanded[] = [];

  for (const part of expanded) {
    let placed = false;
    for (const s of sheets) {
      if (attemptPlace(s, part)) {
        placed = true;
        break;
      }
    }
    if (!placed) {
      const s: SheetState = {
        index: sheets.length + 1,
        freeRects: [{ x: 0, y: 0, w: sheet.lengthMm, h: sheet.widthMm }],
        placed: [],
      };
      sheets.push(s);
      if (!attemptPlace(s, part)) unplaced.push(part);
    }
  }

  const sheetArea = sheet.lengthMm * sheet.widthMm;
  const result: NestedSheet[] = sheets.map((s) => {
    const usedArea = s.placed.reduce((sum, p) => sum + p.realLengthMm * p.realWidthMm, 0);
    return {
      index: s.index,
      parts: s.placed.map((p) => ({
        id: p.id,
        label: p.label,
        x: p.x,
        y: p.y,
        w: p.placedW,
        h: p.placedH,
        lengthMm: p.realLengthMm,
        widthMm: p.realWidthMm,
        rotated: p.rotated,
      })),
      usedAreaMm2: Math.round(usedArea),
      utilisation: Number((usedArea / sheetArea).toFixed(3)),
    };
  });

  const totalUsed = result.reduce((sum, s) => sum + s.usedAreaMm2, 0);
  return {
    sheet: { lengthMm: sheet.lengthMm, widthMm: sheet.widthMm },
    sheets: result,
    sheetCount: result.length,
    totalPartAreaMm2: totalUsed,
    overallUtilisation: Number((totalUsed / (sheetArea * Math.max(1, result.length))).toFixed(3)),
    unplaced,
  };
}
