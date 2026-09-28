import { useState } from "react";
import {
  Anchor,
  Download,
  Moon,
  Save,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useBlobStore } from "@/lib/store";
import { explainReality } from "@/lib/ai";
import { MATERIALS } from "@/lib/blob/materials";
import { REGIONS } from "@/lib/blob/data";
import { buildPacket, cutListCsv, nestedDxf, nestedSvg, replayJson } from "@/lib/blob/exports";
import { downloadText, formatMoney } from "@/lib/utils";
import type { MaterialId, RealityBand, RegionId } from "@/lib/blob/types";

function bandTone(band: RealityBand) {
  return band === "green" ? "ready" : band === "amber" ? "caution" : "blocked";
}

function bandLabel(band: RealityBand, status: string) {
  if (status === "FAIL") return "Blocked";
  if (status === "REVIEW") return "Caution";
  return "Ready";
}

function DimBar({ label, value }: { label: string; value: number | null }) {
  const n = value ?? 0;
  return (
    <div className="grid grid-cols-[7rem_1fr_2.5rem] items-center gap-2 text-xs">
      <span className="text-muted">{label}</span>
      <div className="h-1.5 overflow-hidden rounded-full bg-elevated">
        <div
          className="h-full rounded-full bg-blob"
          style={{ width: `${Math.max(4, Math.min(100, n))}%` }}
        />
      </div>
      <span className="tabular text-right text-fg">{value == null ? "—" : Math.round(n)}</span>
    </div>
  );
}

export function Inspector({ aiOn }: { aiOn: boolean }) {
  const result = useBlobStore((s) => s.result);
  const tab = useBlobStore((s) => s.tab);
  const setTab = useBlobStore((s) => s.setTab);
  const applySpec = useBlobStore((s) => s.applySpec);
  const region = useBlobStore((s) => s.region);
  const setRegion = useBlobStore((s) => s.setRegion);
  const ageYears = useBlobStore((s) => s.ageYears);
  const setAgeYears = useBlobStore((s) => s.setAgeYears);
  const runDream = useBlobStore((s) => s.runDream);
  const dreaming = useBlobStore((s) => s.dreaming);
  const dream = useBlobStore((s) => s.dream);
  const snapshot = useBlobStore((s) => s.snapshot);
  const snapshots = useBlobStore((s) => s.snapshots);
  const restore = useBlobStore((s) => s.restore);
  const [why, setWhy] = useState<string | null>(null);
  const [asking, setAsking] = useState(false);

  if (!result) {
    return (
      <div className="flex h-full flex-col justify-center px-6 text-sm text-muted">
        <p className="font-display text-xl text-fg">Nothing has formed yet.</p>
        <p className="mt-2 leading-relaxed">
          Speak or type a thing you want to make. The blob will listen, shape, then check whether it can physically exist.
        </p>
      </div>
    );
  }

  const { spec, reality, cutList, cost, assembly, intent } = result;
  const def = cutList.checks.shelfDeflection;
  const tip = cutList.checks.tipOver;

  const askWhy = async () => {
    setAsking(true);
    try {
      const summary = [
        `Design: ${spec.kind} ${spec.widthMm}×${spec.heightMm}×${spec.depthMm} mm, ${spec.thicknessMm} mm ${cutList.material.label}, ${spec.shelves} shelves, span ${cutList.spanMm} mm.`,
        `Sag immediate ${def.immediateMm} mm, long-term ${def.longTermMm} mm, allowance ${def.limitMm} mm, utilisation ${Math.round(def.utilisation * 100)}%, pass ${def.pass}.`,
        `E assumed ${cutList.material.E} MPa, verified ${cutList.material.verified}.`,
        `Tip-over margin ${tip.margin}, anchored ${spec.anchored}.`,
        `Score ${reality.score} ${reality.status}. Issues: ${reality.issues.join(" ") || "none"}. Mitigations: ${reality.mitigations.join(" ") || "none"}.`,
        `Cost ${cost.total} ${cost.currency}, unpriced ${cost.unpriced.length}.`,
      ].join("\n");
      const out = await explainReality({ data: { summary } });
      setWhy(out.ok ? out.text : out.error);
    } finally {
      setAsking(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex items-start justify-between gap-3 px-5 pt-5 pb-3">
        <div>
          <p className="text-[11px] tracking-[0.18em] text-muted uppercase">Reality score</p>
          <div className="mt-1 flex items-baseline gap-3">
            <span className="font-display text-4xl tabular leading-none text-fg">{reality.score}</span>
            <Badge tone={bandTone(reality.band)}>{bandLabel(reality.band, reality.status)}</Badge>
          </div>
          <p className="mt-1 text-xs text-muted">
            {reality.status === "FAIL"
              ? "Do not cut as specified."
              : reality.status === "REVIEW"
                ? "Buildable with the listed mitigations."
                : "Buildable as drawn."}
          </p>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={snapshot}>
          <Save /> Snapshot
        </Button>
      </header>
      <Separator />
      <Tabs value={tab} onValueChange={setTab} className="flex min-h-0 flex-1 flex-col">
        <TabsList className="mx-4 mt-3 shrink-0">
          <TabsTrigger value="reality">Reality</TabsTrigger>
          <TabsTrigger value="structure">Structure</TabsTrigger>
          <TabsTrigger value="cut">Cut list</TabsTrigger>
          <TabsTrigger value="cost">Cost</TabsTrigger>
          <TabsTrigger value="assemble">Assemble</TabsTrigger>
          <TabsTrigger value="dream">Dream</TabsTrigger>
        </TabsList>
        <ScrollArea className="min-h-0 flex-1 px-5 py-4">
          <TabsContent value="reality" className="space-y-4">
            <div className="space-y-2">
              <DimBar label="Physics" value={reality.dimensions.physics} />
              <DimBar label="Safety" value={reality.dimensions.safety} />
              <DimBar label="Making" value={reality.dimensions.manufacturability} />
              <DimBar label="Cost" value={reality.dimensions.cost} />
              <DimBar label="Complexity" value={reality.dimensions.complexity} />
              <DimBar label="Energy" value={reality.dimensions.energy} />
            </div>
            <pre className="overflow-x-auto rounded-lg bg-elevated p-3 font-mono text-[11px] leading-5 text-blob">
              {intent.graph}
            </pre>
            {intent.openQuestions.length > 0 && (
              <div>
                <p className="mb-2 text-xs tracking-wide text-muted uppercase">Assumed, not understood</p>
                <ul className="space-y-1.5 text-sm">
                  {intent.openQuestions.map((q) => (
                    <li key={q.slot} className="text-fg/90">
                      {q.question}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {reality.issues.length > 0 && (
              <div className="space-y-2">
                {reality.issues.map((i) => (
                  <p key={i} className="rounded-md bg-blocked/10 px-3 py-2 text-sm text-blocked">
                    {i}
                  </p>
                ))}
              </div>
            )}
            {reality.mitigations.length > 0 && (
              <div className="space-y-2">
                {reality.mitigations.map((i) => (
                  <p key={i} className="rounded-md bg-blob/10 px-3 py-2 text-sm text-blob">
                    {i}
                  </p>
                ))}
              </div>
            )}
            {aiOn && (
              <Button type="button" variant="ghost" size="sm" onClick={askWhy} disabled={asking}>
                <Sparkles />
                {asking ? "Tracing…" : "Why these numbers?"}
              </Button>
            )}
            {why && <p className="text-sm leading-relaxed text-fg/90">{why}</p>}
          </TabsContent>

          <TabsContent value="structure" className="space-y-5">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <label className="space-y-1">
                <span className="text-xs text-muted">Width mm</span>
                <Input
                  type="number"
                  value={spec.widthMm}
                  onChange={(e) => applySpec({ widthMm: Number(e.target.value) })}
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs text-muted">Height mm</span>
                <Input
                  type="number"
                  value={spec.heightMm}
                  onChange={(e) => applySpec({ heightMm: Number(e.target.value) })}
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs text-muted">Depth mm</span>
                <Input
                  type="number"
                  value={spec.depthMm}
                  onChange={(e) => applySpec({ depthMm: Number(e.target.value) })}
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs text-muted">Shelves</span>
                <Input
                  type="number"
                  min={2}
                  value={spec.shelves}
                  onChange={(e) => applySpec({ shelves: Number(e.target.value) })}
                />
              </label>
            </div>
            <div>
              <p className="mb-2 text-xs text-muted">Stock thickness</p>
              <div className="flex flex-wrap gap-2">
                {MATERIALS[spec.material].thicknessesMm.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => applySpec({ thicknessMm: t })}
                    className={`h-10 rounded-md px-3 text-sm tabular ${
                      spec.thicknessMm === t ? "bg-fg text-bg" : "border border-border text-fg"
                    }`}
                  >
                    {t} mm
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs text-muted">Material</p>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(MATERIALS) as MaterialId[]).map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => applySpec({ material: id })}
                    className={`h-10 rounded-md px-3 text-xs ${
                      spec.material === id ? "bg-fg text-bg" : "border border-border text-fg"
                    }`}
                  >
                    {MATERIALS[id].label.split(" ")[0]}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-muted">{cutList.material.label}. E = {cutList.material.E} MPa · handbook, not a datasheet.</p>
            </div>
            <button
              type="button"
              onClick={() => applySpec({ anchored: !spec.anchored })}
              className={`flex h-11 w-full items-center justify-center gap-2 rounded-md border text-sm ${
                spec.anchored ? "border-blob bg-blob/10 text-blob" : "border-border"
              }`}
            >
              <Anchor className="size-4" />
              {spec.anchored ? "Anchored to the wall" : "Freestanding — wall fix off"}
            </button>
            <div className="rounded-lg border border-border p-3 text-sm">
              <p className="tabular">
                Long-term sag <strong>{def.longTermMm} mm</strong> vs allowance {def.limitMm} mm
              </p>
              <p className="mt-1 text-muted">
                Span {cutList.spanMm} mm · {def.pass ? "passes L/360" : "fails L/360"} · mass {cutList.totalMassKg} kg
              </p>
              <p className="mt-1 text-muted">
                Tip-over margin {tip.margin} · rear drop {tip.rearDropMm} mm gains {tip.marginGain ?? 0}
              </p>
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between text-xs text-muted">
                <span>After {ageYears} years</span>
                <span className="tabular">creep toward 2× immediate sag</span>
              </div>
              <Slider min={0} max={10} step={1} value={[ageYears]} onValueChange={(v) => setAgeYears(v[0] ?? 0)} />
            </div>
            {result.alternatives.slice(0, 3).map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => applySpec({ material: a.id as MaterialId })}
                className="block w-full rounded-md border border-border px-3 py-2 text-left text-sm hover:bg-elevated"
              >
                <span className="text-fg">{a.label}</span>
                <span className="mt-0.5 block text-xs text-muted">
                  stiffness ×{a.stiffnessVsPrimary} · mass ×{a.massVsPrimary} · {a.reason}
                </span>
              </button>
            ))}
          </TabsContent>

          <TabsContent value="cut" className="space-y-3">
            <table className="w-full text-left text-xs">
              <thead className="text-muted">
                <tr>
                  <th className="py-1 font-medium">Part</th>
                  <th className="py-1 font-medium tabular">Qty</th>
                  <th className="py-1 font-medium tabular">L × W × T</th>
                </tr>
              </thead>
              <tbody>
                {cutList.parts.map((p) => (
                  <tr key={p.id} className="border-t border-border">
                    <td className="py-2 pr-2">{p.label}</td>
                    <td className="tabular">{p.qty}</td>
                    <td className="tabular text-muted">
                      {p.lengthMm} × {p.widthMm} × {p.thicknessMm}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-muted">
              Nesting {cutList.nesting.carcassSheetCount} sheet(s) · {Math.round(cutList.nesting.carcass.overallUtilisation * 100)}% yield · grain locked
            </p>
            {cutList.nesting.carcass.sheets.map((s) => (
              <svg
                key={s.index}
                viewBox={`0 0 ${cutList.nesting.carcass.sheet.lengthMm} ${cutList.nesting.carcass.sheet.widthMm}`}
                className="w-full rounded-md border border-border bg-bg"
              >
                {s.parts.map((p) => (
                  <rect
                    key={p.id}
                    x={p.x}
                    y={p.y}
                    width={p.w}
                    height={p.h}
                    fill="rgba(94,234,212,0.16)"
                    stroke="#5eead4"
                    strokeWidth="4"
                  />
                ))}
              </svg>
            ))}
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => downloadText("cut-list.csv", cutListCsv(result), "text/csv")}>
                <Download /> CSV
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => downloadText("nested-layout.svg", nestedSvg(result), "image/svg+xml")}>
                <Download /> SVG
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => downloadText("nested-layout.dxf", nestedDxf(result), "application/dxf")}>
                <Download /> DXF
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => downloadText("SBM.txt", buildPacket(result))}>
                <Download /> Packet
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => downloadText("replay.json", replayJson(result), "application/json")}>
                <Download /> Replay
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="cost" className="space-y-4">
            <div className="flex gap-2">
              {(Object.keys(REGIONS) as RegionId[]).map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setRegion(id)}
                  className={`h-10 rounded-md px-3 text-xs ${region === id ? "bg-fg text-bg" : "border border-border"}`}
                >
                  {id === "au-qld-local" ? "Gold Coast local" : "China bulk"}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted">{REGIONS[region].note}</p>
            <p className="font-display text-3xl tabular">
              {cost.unpriced.length && cost.lines.length === 0
                ? "unpriced"
                : formatMoney(cost.total, cost.currency)}
            </p>
            <ul className="space-y-2 text-sm">
              {cost.lines.map((l) => (
                <li key={l.key} className="flex justify-between gap-3">
                  <span>
                    {l.label}
                    {l.basisMismatch && <span className="ml-2 text-caution">bulk-tier</span>}
                  </span>
                  <span className="tabular text-muted">
                    {l.lineTotal} {l.currency}
                  </span>
                </li>
              ))}
              {cost.tax && (
                <li className="flex justify-between text-muted">
                  <span>{cost.tax.label}</span>
                  <span className="tabular">
                    {cost.tax.amount} {cost.currency}
                  </span>
                </li>
              )}
            </ul>
            {cost.unpriced.map((u) => (
              <p key={u.key} className="rounded-md bg-caution/10 px-3 py-2 text-sm text-caution">
                Unpriced: {u.label}. {u.reason}
              </p>
            ))}
            <p className="text-xs text-muted">{cost.confidence.note}</p>
          </TabsContent>

          <TabsContent value="assemble" className="space-y-4">
            <ol className="space-y-4">
              {assembly.steps.map((s) => (
                <li key={s.step} className="grid grid-cols-[2rem_1fr] gap-3">
                  <span className="tabular text-muted">{String(s.step).padStart(2, "0")}</span>
                  <div>
                    <p className="text-sm font-medium">{s.title}</p>
                    <p className="mt-1 text-sm text-fg/85">{s.detail}</p>
                    <p className="mt-1 text-xs text-muted">Why: {s.reason}</p>
                  </div>
                </li>
              ))}
            </ol>
          </TabsContent>

          <TabsContent value="dream" className="space-y-4">
            <Button type="button" variant="ghost" onClick={runDream} disabled={dreaming}>
              <Moon />
              {dreaming ? "Exploring…" : "Explore nearby designs"}
            </Button>
            {dream && (
              <>
                <p className="text-sm text-muted">
                  {dream.explored} variants recomputed. {dream.note}
                </p>
                {dream.best.map((v, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => applySpec(v.change as Partial<typeof spec>)}
                    className="block w-full rounded-md border border-border px-3 py-2 text-left text-sm hover:bg-elevated"
                  >
                    <span className="tabular text-fg">
                      score {v.score} · {Object.entries(v.change).map(([k, val]) => `${k} ${String(val)}`).join(", ")}
                    </span>
                    {v.total != null && (
                      <span className="mt-0.5 block text-xs text-muted">
                        {formatMoney(v.total, v.currency ?? cost.currency)}
                      </span>
                    )}
                  </button>
                ))}
              </>
            )}
            {snapshots.length > 0 && (
              <div>
                <p className="mb-2 text-xs tracking-wide text-muted uppercase">Memory crystal</p>
                <ul className="space-y-2">
                  {snapshots.map((s) => (
                    <li key={s.id}>
                      <button
                        type="button"
                        onClick={() => restore(s.id)}
                        className="w-full rounded-md border border-border px-3 py-2 text-left text-sm hover:bg-elevated"
                      >
                        {s.label}
                        <span className="mt-0.5 block text-xs text-muted">score {s.score}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}
