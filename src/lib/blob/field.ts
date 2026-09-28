import type { MetaballNode } from "./types";

const EPS = 1e-6;
export const DEFAULT_THRESHOLD = 1.0;

export function fieldAt(nodes: MetaballNode[], x: number, y: number) {
  let f = 0;
  for (const n of nodes) {
    const dx = x - n.x;
    const dy = y - n.y;
    const d2 = dx * dx + dy * dy;
    f += ((n.w ?? 1) * n.r * n.r) / Math.max(d2, EPS);
  }
  return f;
}

export function isInside(nodes: MetaballNode[], x: number, y: number, threshold = DEFAULT_THRESHOLD) {
  return fieldAt(nodes, x, y) >= threshold;
}

export function densityAt(nodes: MetaballNode[], x: number, y: number, threshold = DEFAULT_THRESHOLD) {
  const f = fieldAt(nodes, x, y);
  return Math.max(0, Math.min(1, f / (threshold * 2.5)));
}

function key(p: [number, number]) {
  return `${Math.round(p[0] * 1e4)}:${Math.round(p[1] * 1e4)}`;
}

function stitch(segments: [[number, number], [number, number]][]) {
  const byStart = new Map<string, number[]>();
  segments.forEach((s, i) => {
    const k = key(s[0]);
    if (!byStart.has(k)) byStart.set(k, []);
    byStart.get(k)!.push(i);
  });
  const used = new Array(segments.length).fill(false);
  const polylines: [number, number][][] = [];
  for (let i = 0; i < segments.length; i++) {
    if (used[i]) continue;
    used[i] = true;
    const line: [number, number][] = [segments[i][0], segments[i][1]];
    for (;;) {
      const candidates = byStart.get(key(line[line.length - 1])) || [];
      const nextIdx = candidates.find((c) => !used[c]);
      if (nextIdx === undefined) break;
      used[nextIdx] = true;
      line.push(segments[nextIdx][1]);
      if (key(line[line.length - 1]) === key(line[0])) break;
    }
    polylines.push(line);
  }
  polylines.sort((a, b) => b.length - a.length);
  return polylines;
}

export function contour(nodes: MetaballNode[], { res = 64, threshold = DEFAULT_THRESHOLD } = {}) {
  const step = 1 / res;
  const segments: [[number, number], [number, number]][] = [];
  const interp = (xa: number, ya: number, va: number, xb: number, yb: number, vb: number): [number, number] => {
    const denom = vb - va;
    const t = Math.abs(denom) < EPS ? 0.5 : (threshold - va) / denom;
    return [xa + (xb - xa) * t, ya + (yb - ya) * t];
  };

  for (let i = 0; i < res; i++) {
    for (let j = 0; j < res; j++) {
      const x0 = i * step, y0 = j * step, x1 = x0 + step, y1 = y0 + step;
      const v0 = fieldAt(nodes, x0, y0);
      const v1 = fieldAt(nodes, x1, y0);
      const v2 = fieldAt(nodes, x1, y1);
      const v3 = fieldAt(nodes, x0, y1);
      let idx = 0;
      if (v0 >= threshold) idx |= 1;
      if (v1 >= threshold) idx |= 2;
      if (v2 >= threshold) idx |= 4;
      if (v3 >= threshold) idx |= 8;
      if (idx === 0 || idx === 15) continue;
      const bottom = () => interp(x0, y0, v0, x1, y0, v1);
      const right = () => interp(x1, y0, v1, x1, y1, v2);
      const top = () => interp(x0, y1, v3, x1, y1, v2);
      const left = () => interp(x0, y0, v0, x0, y1, v3);
      const table: Record<number, [[number, number], [number, number]]> = {
        1: [left(), bottom()],
        2: [bottom(), right()],
        3: [left(), right()],
        4: [right(), top()],
        5: [left(), top()],
        6: [bottom(), top()],
        7: [left(), top()],
        8: [top(), left()],
        9: [top(), bottom()],
        10: [bottom(), left()],
        11: [top(), right()],
        12: [right(), left()],
        13: [right(), bottom()],
        14: [bottom(), right()],
      };
      const seg = table[idx];
      if (seg) segments.push(seg);
    }
  }
  return stitch(segments);
}
