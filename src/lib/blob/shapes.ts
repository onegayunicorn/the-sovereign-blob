import type { CutList, MetaballNode, Plan, ShapeProgram, Spec } from "./types";

function lcg(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (1664525 * s + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export function amorphous(seed = 1, count = 14): ShapeProgram {
  const rnd = lcg(seed);
  const nodes: MetaballNode[] = [];
  for (let i = 0; i < count; i++) {
    nodes.push({
      x: 0.15 + rnd() * 0.7,
      y: 0.1 + rnd() * 0.8,
      r: 0.06 + rnd() * 0.09,
      w: 0.6 + rnd() * 0.4,
    });
  }
  return { kind: "amorphous", nodes, seed };
}

export function bookshelfShape(spec: Partial<Spec> = {}): ShapeProgram {
  const shelves = Math.max(2, spec.shelves ?? 5);
  const nodes: MetaballNode[] = [];
  const R = 0.045;
  const nodesPerVertical = 9;
  for (const vx of [0.16, 0.84]) {
    for (let i = 0; i < nodesPerVertical; i++) {
      const t = i / (nodesPerVertical - 1);
      nodes.push({ x: vx, y: 0.08 + t * 0.84, r: R, w: 1 });
    }
  }
  for (let i = 0; i < shelves; i++) {
    const t = shelves === 1 ? 0.5 : i / (shelves - 1);
    const y = 0.08 + t * 0.84;
    const nodesPerShelf = 7;
    for (let j = 0; j < nodesPerShelf; j++) {
      const u = j / (nodesPerShelf - 1);
      nodes.push({ x: 0.16 + u * 0.68, y, r: R, w: 1 });
    }
  }
  return { kind: "bookshelf", nodes };
}

export function tableShape(spec: Partial<Spec> = {}): ShapeProgram {
  const nodes: MetaballNode[] = [];
  const aspect = (spec.widthMm ?? 1400) / (spec.heightMm ?? 750);
  const topY = 0.28;
  const legInset = aspect > 1.6 ? 0.14 : 0.18;
  for (const vx of [legInset, 1 - legInset]) {
    for (let i = 0; i < 5; i++) nodes.push({ x: vx, y: 0.32 + (i / 4) * 0.56, r: 0.045, w: 1 });
  }
  const topCount = 9;
  for (let j = 0; j < topCount; j++) {
    nodes.push({ x: 0.12 + (j / (topCount - 1)) * 0.76, y: topY, r: 0.055, w: 1.1 });
  }
  return { kind: "table", nodes };
}

export function genericBoxShape(): ShapeProgram {
  const nodes: MetaballNode[] = [];
  const ring: [number, number][] = [
    [0.2, 0.15], [0.5, 0.1], [0.8, 0.15], [0.85, 0.5], [0.8, 0.85], [0.5, 0.9], [0.2, 0.85], [0.15, 0.5],
  ];
  for (const [x, y] of ring) nodes.push({ x, y, r: 0.11, w: 1 });
  return { kind: "generic", nodes };
}

export function shapeForTemplate(template: string, spec: Partial<Spec>) {
  switch (template) {
    case "bookshelf":
      return bookshelfShape(spec);
    case "table":
      return tableShape(spec);
    default:
      return genericBoxShape();
  }
}

export function morph(from: ShapeProgram, to: ShapeProgram, t: number): ShapeProgram {
  const n = Math.max(from.nodes.length, to.nodes.length);
  const nodes: MetaballNode[] = [];
  for (let i = 0; i < n; i++) {
    const a = from.nodes[i];
    const b = to.nodes[i];
    const ax = a ? a.x : b.x;
    const ay = a ? a.y : b.y;
    const bx = b ? b.x : a.x;
    const by = b ? b.y : a.y;
    const ar = a ? a.r : 0;
    const br = b ? b.r : 0;
    const wobble = Math.sin(Math.PI * t) * 0.012;
    const aw = a ? (a.w ?? 1) : 0;
    const bw = b ? (b.w ?? 1) : 0;
    nodes.push({
      x: ax + (bx - ax) * t + Math.sin(i * 2.3) * wobble,
      y: ay + (by - ay) * t + Math.cos(i * 1.7) * wobble,
      r: ar + (br - ar) * t,
      w: aw + (bw - aw) * t,
    });
  }
  return { kind: to.kind, nodes, progress: t };
}

export function breathe(shape: ShapeProgram, timeSec: number, energy = 1): ShapeProgram {
  const nodes = shape.nodes.map((n, i) => {
    const pulse = 1 + Math.sin(timeSec * 1.4 + i * 0.55) * 0.045 * energy;
    const drift = 0.008 * energy;
    return {
      ...n,
      x: n.x + Math.sin(timeSec * 0.6 + i * 1.1) * drift,
      y: n.y + Math.cos(timeSec * 0.5 + i * 0.9) * drift,
      r: n.r * pulse,
    };
  });
  return { ...shape, nodes };
}

export function rectilinearPlan(cutList: CutList): Plan {
  const { spec } = cutList;
  const t = spec.thicknessMm;
  if (spec.kind === "table") {
    const leg = Math.max(40, Math.min(90, Math.round(spec.depthMm * 0.1)));
    return {
      kind: "plan",
      units: "mm",
      widthMm: spec.widthMm,
      heightMm: spec.heightMm,
      depthMm: spec.depthMm,
      rects: [
        { id: "top", x: 0, y: spec.heightMm - t, w: spec.widthMm, h: t, kind: "top" },
        { id: "leg-L", x: 0, y: 0, w: t, h: spec.heightMm - t, kind: "leg" },
        { id: "leg-R", x: spec.widthMm - t, y: 0, w: t, h: spec.heightMm - t, kind: "leg" },
        { id: "apron", x: t, y: spec.heightMm - t - 90, w: spec.widthMm - 2 * t, h: 20, kind: "apron" },
      ],
    };
  }
  const rects: Plan["rects"] = [];
  rects.push({ id: "side-L", x: 0, y: 0, w: t, h: spec.heightMm, kind: "side" });
  rects.push({ id: "side-R", x: spec.widthMm - t, y: 0, w: t, h: spec.heightMm, kind: "side" });
  for (let i = 0; i < spec.shelves; i++) {
    const y = i * ((spec.heightMm - t) / Math.max(1, spec.shelves - 1));
    rects.push({
      id: `shelf-${i + 1}`,
      x: t,
      y: Math.min(y, spec.heightMm - t),
      w: spec.widthMm - 2 * t,
      h: t,
      kind: "shelf",
    });
  }
  if (spec.plinth) {
    rects.push({
      id: "plinth",
      x: t,
      y: 0,
      w: spec.widthMm - 2 * t,
      h: spec.plinthHeightMm,
      kind: "plinth",
    });
  }
  return { kind: "plan", units: "mm", widthMm: spec.widthMm, heightMm: spec.heightMm, depthMm: spec.depthMm, rects };
}

export function elevations(cutList: CutList) {
  const { spec } = cutList;
  const t = spec.thicknessMm;
  const shelfYs: number[] = [];
  for (let i = 0; i < spec.shelves; i++) {
    const y = i * ((spec.heightMm - t) / Math.max(1, spec.shelves - 1));
    shelfYs.push(Math.min(y, spec.heightMm - t));
  }
  return {
    front: { widthMm: spec.widthMm, heightMm: spec.heightMm, shelfYs, thicknessMm: t },
    side: { widthMm: spec.depthMm, heightMm: spec.heightMm, shelfYs, thicknessMm: t },
    clearBaysMm: shelfYs.slice(1).map((y, i) => Math.round(y - (shelfYs[i] + t))),
  };
}
