import type { PipelineResult } from "./types";

export function cutListCsv(result: PipelineResult) {
  const rows = [
    ["part", "qty", "length_mm", "width_mm", "thickness_mm", "material", "grain", "banded_edges", "mass_kg"],
    ...result.cutList.parts.map((p) => [
      p.label,
      String(p.qty),
      String(p.lengthMm),
      String(p.widthMm),
      String(p.thicknessMm),
      p.material || result.cutList.material.id,
      p.grainSensitive ? "along-length" : "none",
      (p.edgesBanded || []).join("|") || "none",
      String(p.massKg ?? ""),
    ]),
  ];
  return rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
}

export function nestedSvg(result: PipelineResult) {
  const nest = result.cutList.nesting.carcass;
  const sheet = nest.sheet;
  const gap = 40;
  const totalW = sheet.lengthMm;
  const totalH = sheet.widthMm * nest.sheetCount + gap * Math.max(0, nest.sheetCount - 1);
  const parts = nest.sheets
    .map((s, si) => {
      const oy = si * (sheet.widthMm + gap);
      const outline = `<rect x="0" y="${oy}" width="${sheet.lengthMm}" height="${sheet.widthMm}" fill="none" stroke="#8a8d94" stroke-width="2"/>`;
      const placed = s.parts
        .map(
          (p) =>
            `<g>
              <rect x="${p.x}" y="${oy + p.y}" width="${p.w}" height="${p.h}" fill="rgba(94,234,212,0.18)" stroke="#5eead4" stroke-width="1.2"/>
              <text x="${p.x + 8}" y="${oy + p.y + 18}" font-size="14" font-family="ui-monospace, monospace" fill="#e8e6e1">${p.id}</text>
            </g>`,
        )
        .join("");
      return outline + placed;
    })
    .join("");
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalW} ${totalH}" width="${totalW}" height="${totalH}">
  <rect width="100%" height="100%" fill="#07080c"/>
  ${parts}
</svg>`;
}

export function nestedDxf(result: PipelineResult) {
  const nest = result.cutList.nesting.carcass;
  const lines: string[] = [];
  const addRect = (x: number, y: number, w: number, h: number) => {
    const pts: [number, number][] = [
      [x, y],
      [x + w, y],
      [x + w, y + h],
      [x, y + h],
      [x, y],
    ];
    for (let i = 0; i < 4; i++) {
      lines.push("0", "LINE", "8", "0", "10", String(pts[i][0]), "20", String(pts[i][1]), "11", String(pts[i + 1][0]), "21", String(pts[i + 1][1]));
    }
  };
  nest.sheets.forEach((s, si) => {
    const ox = si * (nest.sheet.lengthMm + 40);
    addRect(ox, 0, nest.sheet.lengthMm, nest.sheet.widthMm);
    for (const p of s.parts) addRect(ox + p.y, p.x, p.h, p.w);
  });
  return ["0", "SECTION", "2", "HEADER", "9", "$INSUNITS", "70", "4", "0", "ENDSEC", "0", "SECTION", "2", "ENTITIES", ...lines, "0", "ENDSEC", "0", "EOF"].join("\n");
}

export function buildPacket(result: PipelineResult) {
  const { spec, cutList, cost, reality, assembly, intent } = result;
  const def = cutList.checks.shelfDeflection;
  const status = reality.status === "FAIL" ? "BLOCKED — DO NOT CUT AS SPECIFIED" : reality.status === "REVIEW" ? "CAUTION — REVIEW BEFORE CUTTING" : "READY FOR FABRICATION";
  return `SOVEREIGN BLOB MANIFEST
${status}
Reality score ${reality.score} (${reality.band}) · ${reality.status}

INTENT
${intent.utterance}
${intent.graph}

SPEC
${spec.kind}  ${spec.widthMm} × ${spec.heightMm} × ${spec.depthMm} mm
stock ${spec.thicknessMm} mm ${cutList.material.label}
shelves ${spec.shelves} · span ${cutList.spanMm} mm · load ${spec.loadPerShelfKg} kg
anchored ${spec.anchored ? "yes" : "no"} · joinery ${cutList.joinery.label}

STRUCTURE
immediate sag ${def.immediateMm} mm
long-term sag ${def.longTermMm} mm
allowance ${def.limitMm} mm (${Math.round(def.utilisation * 100)}%)
verdict ${def.pass ? "PASS" : "FAIL"}
tip-over margin ${cutList.checks.tipOver.margin} (anchor required: ${cutList.checks.tipOver.anchoredRequired})
racking ${cutList.checks.racking.pass ? "PASS" : "FAIL"} — ${cutList.checks.racking.mechanism}

ISSUES
${reality.issues.length ? reality.issues.map((i) => "- " + i).join("\n") : "- none"}

MITIGATIONS
${reality.mitigations.length ? reality.mitigations.map((i) => "- " + i).join("\n") : "- none"}

COST (${cost.currency}, as of ${cost.asOf})
${cost.lines.map((l) => `- ${l.label}  ×${l.qty}  ${l.lineTotal} ${l.currency}${l.basisMismatch ? "  [bulk-tier, not purchasable at this qty]" : ""}`).join("\n") || "- no priced lines"}
${cost.tax ? `GST ${cost.tax.amount} ${cost.currency}` : ""}
total ${cost.total} ${cost.currency}
unpriced: ${cost.unpriced.length ? cost.unpriced.map((u) => u.label + " (" + u.reason + ")").join("; ") : "none"}
${cost.confidence.note}

CUT LIST
${cutList.parts.map((p) => `- ${p.qty}× ${p.label}  ${p.lengthMm} × ${p.widthMm} × ${p.thicknessMm} mm  grain:${p.grainSensitive ? "along-length" : "none"}`).join("\n")}

NESTING
${cutList.nesting.carcassSheetCount} carcass sheet(s) at ${Math.round(cutList.nesting.carcass.overallUtilisation * 100)}% yield
sheet ${cutList.nesting.carcass.sheet.lengthMm} × ${cutList.nesting.carcass.sheet.widthMm} mm

ASSEMBLY
${assembly.steps.map((s) => `${s.step}. ${s.title}\n   ${s.detail}\n   why: ${s.reason}`).join("\n\n")}

WHAT THIS DOES NOT KNOW
- Elastic modulus is a handbook value, not a measured board.
- ${cost.unpriced.length ? "Some cost lines are unpriced." : "Cost is partial if a bulk-tier line is present."}
- No physical build has calibrated this model.
- This is a first-order hand-calculation, not a structural engineering certificate.
`;
}

export function replayJson(result: PipelineResult) {
  return JSON.stringify(
    {
      utterance: result.utterance,
      intent: result.intent,
      spec: result.spec,
      stages: result.stages,
      reality: result.reality,
      rejected:
        result.cutList.spec.thicknessMm !== 18
          ? undefined
          : result.cutList.checks.shelfDeflection.pass
            ? undefined
            : {
                tried: "18 mm",
                reason: result.cutList.flags.find((f) => f.code === "shelf-sag")?.message,
                corrections: result.reality.mitigations,
              },
    },
    null,
    2,
  );
}
