import { useEffect, useRef } from "react";
import { contour, fieldAt } from "@/lib/blob/field";
import { breathe, morph } from "@/lib/blob/shapes";
import { agedSagMm } from "@/lib/blob/sag";
import { useBlobStore } from "@/lib/store";
import type { MetaballNode, Plan } from "@/lib/blob/types";

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function easeOut(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function drawField(
  ctx: CanvasRenderingContext2D,
  nodes: MetaballNode[],
  width: number,
  height: number,
  colour: string,
  alpha: number,
) {
  if (alpha <= 0.01) return;
  const gw = 110;
  const gh = Math.max(64, Math.round((gw * height) / width));
  const buf = ctx.createImageData(gw, gh);
  const rgb = hexToRgb(colour);
  const threshold = 1.0;
  for (let j = 0; j < gh; j++) {
    for (let i = 0; i < gw; i++) {
      const x = i / (gw - 1);
      const y = j / (gh - 1);
      const f = fieldAt(nodes, x, y);
      const d = Math.max(0, Math.min(1, f / (threshold * 2.2)));
      const inside = d > 0.42;
      const k = (j * gw + i) * 4;
      if (inside) {
        const glow = Math.min(1, d);
        buf.data[k] = Math.round(lerp(8, rgb[0], glow));
        buf.data[k + 1] = Math.round(lerp(10, rgb[1], glow));
        buf.data[k + 2] = Math.round(lerp(14, rgb[2], glow));
        buf.data[k + 3] = Math.round((90 + 150 * glow) * alpha);
      }
    }
  }
  const off = document.createElement("canvas");
  off.width = gw;
  off.height = gh;
  off.getContext("2d")!.putImageData(buf, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(off, 0, 0, width, height);

  const lines = contour(nodes, { res: 72, threshold });
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = colour;
  ctx.globalAlpha = 0.85 * alpha;
  ctx.beginPath();
  for (const line of lines) {
    line.forEach(([x, y], i) => {
      if (i === 0) ctx.moveTo(x * width, y * height);
      else ctx.lineTo(x * width, y * height);
    });
  }
  ctx.stroke();
  ctx.globalAlpha = 1;
}

function drawPlan(
  ctx: CanvasRenderingContext2D,
  plan: Plan,
  width: number,
  height: number,
  colour: string,
  alpha: number,
  sagPx: number,
) {
  if (alpha <= 0.01) return;
  const pad = Math.min(width, height) * 0.12;
  const scale = Math.min((width - pad * 2) / plan.widthMm, (height - pad * 2) / plan.heightMm);
  const ox = (width - plan.widthMm * scale) / 2;
  const oy = (height - plan.heightMm * scale) / 2;
  const toX = (x: number) => ox + x * scale;
  const toY = (y: number) => oy + (plan.heightMm - y) * scale;

  ctx.save();
  ctx.globalAlpha = alpha * 0.35;
  ctx.strokeStyle = "rgba(232,230,225,0.12)";
  ctx.lineWidth = 1;
  for (let x = 0; x <= plan.widthMm; x += 100) {
    ctx.beginPath();
    ctx.moveTo(toX(x), toY(0));
    ctx.lineTo(toX(x), toY(plan.heightMm));
    ctx.stroke();
  }
  for (let y = 0; y <= plan.heightMm; y += 100) {
    ctx.beginPath();
    ctx.moveTo(toX(0), toY(y));
    ctx.lineTo(toX(plan.widthMm), toY(y));
    ctx.stroke();
  }
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = alpha;
  for (const r of plan.rects) {
    const bow = r.kind === "shelf" || r.kind === "top" ? sagPx : 0;
    const x = toX(r.x);
    const y = toY(r.y + r.h) + bow;
    const w = r.w * scale;
    const h = Math.max(1.5, r.h * scale);
    ctx.fillStyle =
      r.kind === "side" || r.kind === "leg"
        ? "rgba(94,234,212,0.16)"
        : r.kind === "plinth" || r.kind === "apron"
          ? "rgba(232,184,109,0.14)"
          : "rgba(94,234,212,0.10)";
    ctx.strokeStyle = colour;
    ctx.lineWidth = 1.2;
    if (bow > 0.4) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + w / 2, y + bow * 1.6, x + w, y);
      ctx.lineTo(x + w, y + h);
      ctx.quadraticCurveTo(x + w / 2, y + h + bow * 1.6, x, y + h);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.fillRect(x, y, w, h);
      ctx.strokeRect(x, y, w, h);
    }
  }
  ctx.strokeStyle = colour;
  ctx.lineWidth = 1.4;
  ctx.strokeRect(toX(0), toY(plan.heightMm), plan.widthMm * scale, plan.heightMm * scale);
  ctx.fillStyle = "rgba(232,230,225,0.72)";
  ctx.font = "11px 'IBM Plex Mono', ui-monospace, monospace";
  ctx.fillText(`${plan.widthMm} mm`, toX(0), toY(plan.heightMm) - 8);
  ctx.save();
  ctx.translate(toX(0) - 10, toY(0));
  ctx.rotate(-Math.PI / 2);
  ctx.fillText(`${plan.heightMm} mm`, 0, 0);
  ctx.restore();
  ctx.restore();
}

export function BlobCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phase = useBlobStore((s) => s.phase);
  const startShape = useBlobStore((s) => s.startShape);
  const targetShape = useBlobStore((s) => s.targetShape);
  const result = useBlobStore((s) => s.result);
  const ageYears = useBlobStore((s) => s.ageYears);
  const setMorph = useBlobStore((s) => s.setMorph);
  const setPhase = useBlobStore((s) => s.setPhase);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;
    let raf = 0;
    let last = performance.now();
    let elapsed = 0;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let formingT = useBlobStore.getState().morph;
    const loop = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      elapsed += dt;

      const state = useBlobStore.getState();
      let t = state.phase === "forming" ? formingT : state.morph;
      if (state.phase === "forming") {
        if (reduced) {
          t = 1;
          formingT = 1;
          setMorph(1);
          setPhase("settled");
        } else {
          formingT = Math.min(1, formingT + dt / 2.4);
          t = formingT;
          if (formingT >= 1) {
            setMorph(1);
            setPhase("settled");
          }
        }
      } else if (state.phase === "idle") {
        formingT = 0;
      }

      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const rect = canvas.getBoundingClientRect();
      const w = Math.max(1, Math.floor(rect.width * dpr));
      const h = Math.max(1, Math.floor(rect.height * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#07080c";
      ctx.fillRect(0, 0, w, h);

      const energy = state.phase === "listening" ? 1.8 : state.phase === "idle" ? 1 : 0.35;
      const colour = state.result?.reality.colour ?? "#5eead4";
      const eased = easeOut(t);
      let nodes = morph(state.startShape, state.targetShape, eased).nodes;
      if (state.phase !== "settled") {
        nodes = breathe({ kind: "live", nodes }, elapsed, energy).nodes;
      }

      const fieldAlpha = 1 - eased * 0.82;
      drawField(ctx, nodes, w, h, colour, fieldAlpha);

      if (state.result && eased > 0.2) {
        const sagMm = agedSagMm(state.result.cutList.checks.shelfDeflection.immediateMm, state.ageYears);
        const pad = Math.min(w, h) * 0.12;
        const scale = Math.min(
          (w - pad * 2) / state.result.plan.widthMm,
          (h - pad * 2) / state.result.plan.heightMm,
        );
        drawPlan(ctx, state.result.plan, w, h, colour, eased, sagMm * scale);
      }

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [phase, startShape, targetShape, result, ageYears, setMorph, setPhase]);

  return (
    <canvas
      ref={canvasRef}
      className="h-full w-full"
      aria-label="Living blob field becoming a dimensioned plan"
    />
  );
}
