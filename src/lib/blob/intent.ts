import type { Intent, KindId, MaterialId, Spec } from "./types";

const NUMBER_WORDS: Record<string, number> = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
};

const LENGTH_UNITS_MM: Record<string, number> = {
  mm: 1, millimetre: 1, centimetre: 10, cm: 10, m: 1000, metre: 1000, meter: 1000,
  in: 25.4, inch: 25.4, inches: 25.4, '"': 25.4, ft: 304.8, foot: 304.8, feet: 304.8,
};

const KINDS: { id: KindId; re: RegExp; template: string }[] = [
  { id: "bookshelf", re: /\b(book ?shelf|bookcase|shelving|shelf|shelves|bookshelf)\b/i, template: "bookshelf" },
  { id: "table", re: /\b(table|desk|bench|workbench)\b/i, template: "table" },
  { id: "frame", re: /\b(frame|rack|stand|mount|cradle|enclosure|box)\b/i, template: "frame" },
  { id: "ui", re: /\b(app|ui|interface|widget|screen|dashboard)\b/i, template: "ui" },
  { id: "concept", re: /\b(theory|concept|simulation|physics|model)\b/i, template: "concept" },
];

const MATERIAL_HINTS: { re: RegExp; id: MaterialId }[] = [
  { re: /\b(birch|plywood|ply)\b/i, id: "birch-plywood" },
  { re: /\b(mdf|fibreboard|particleboard|chipboard)\b/i, id: "mdf" },
  { re: /\b(pine|solid wood|timber|oak|softwood|hardwood)\b/i, id: "solid-pine" },
  { re: /\b(bamboo)\b/i, id: "bamboo" },
  { re: /\b(steel|metal|iron)\b/i, id: "steel-mild" },
  { re: /\b(aluminium|aluminum)\b/i, id: "aluminium" },
];

const PROFILE_RULES = [
  { id: "cost", label: "Minimise cost", re: /\b(cheap|cheapest|budget|low cost|affordable|as little as possible|tight budget)\b/i },
  { id: "storage", label: "Maximise storage", re: /\b(as much storage as possible|maximi[sz]e storage|lots of storage|fit as many books|storage)\b/i },
  { id: "space", label: "Fit a small space", re: /\b(small apartment|tiny room|narrow space|small space|studio flat|tight space|corner)\b/i },
  { id: "safety", label: "Child / seismic safety", re: /\b(child|kid|toddler|baby|earthquake|seismic|safe|safety|tip[- ]?over|anchor|fix(?:ed)? to the wall|anti[- ]?tip)\b/i },
  { id: "sustainability", label: "Sustainability", re: /\b(reclaimed|sustainab|eco|recycled|low carbon|environment)\b/i },
  { id: "aesthetic", label: "Aesthetic direction", re: /\b(futuristic|modern|minimal|industrial|scandinavian|rustic|sleek|statement)\b/i },
  { id: "knockdown", label: "Must flat-pack / re-assemble", re: /\b(flat[- ]?pack|knock[- ]?down|take it apart|move house|demount)\b/i },
  { id: "weight", label: "Keep it light", re: /\b(light|lightweight|easy to move|one person)\b/i },
];

type LengthHit = { valueMm: number; raw: string; unit: string; index: number };

function parseLengths(text: string): LengthHit[] {
  const out: LengthHit[] = [];
  const re =
    /(\d+(?:[.,]\d+)?|one|two|three|four|five|six|seven|eight|nine|ten)\s*(?:(mm|millimetres?|cm|m|metres?|meters?|inches|inch|in|ft|feet|foot)\b|("))/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const raw = m[1].toLowerCase();
    const value = NUMBER_WORDS[raw] ?? parseFloat(raw.replace(",", "."));
    const unitRaw = m[2] ? m[2].toLowerCase() : '"';
    const unitKey = unitRaw.replace(/s$/, "");
    const factor = LENGTH_UNITS_MM[unitKey] ?? LENGTH_UNITS_MM[unitRaw] ?? 1;
    out.push({ valueMm: Math.round(value * factor), raw: m[0].trim(), unit: unitRaw, index: m.index });
  }
  const bare = /(?<![\d.])(\d{2,5})\s*(tall|high|height|wide|width|deep|depth|long|length)\b/gi;
  while ((m = bare.exec(text)) !== null) {
    const hit = m;
    const valueMm = parseInt(hit[1], 10);
    if (!out.some((o) => o.index === hit.index || o.valueMm === valueMm)) {
      out.push({ valueMm, raw: hit[0].trim(), unit: "assumed-mm", index: hit.index });
    }
  }
  out.sort((a, b) => a.index - b.index);
  return out;
}

function assignDimensions(text: string, lengths: LengthHit[]) {
  const slots: { widthMm: number | null; heightMm: number | null; depthMm: number | null } = {
    widthMm: null,
    heightMm: null,
    depthMm: null,
  };
  const rules: { slot: keyof typeof slots; re: RegExp }[] = [
    { slot: "heightMm", re: /(tall|high|height)/ },
    { slot: "widthMm", re: /(wide|width|across|long|length)/ },
    { slot: "depthMm", re: /(deep|depth)/ },
  ];
  let prevEnd = 0;
  for (const l of lengths) {
    const raw = l.raw.toLowerCase();
    const after = text.slice(l.index + l.raw.length, l.index + l.raw.length + 14).toLowerCase();
    const gapBefore = text.slice(Math.max(prevEnd, l.index - 20), l.index).toLowerCase();
    let assigned: keyof typeof slots | null = null;
    for (const r of rules) if (r.re.test(raw)) { assigned = r.slot; break; }
    if (!assigned) for (const r of rules) if (r.re.test(after)) { assigned = r.slot; break; }
    if (!assigned) for (const r of rules) if (r.re.test(gapBefore)) { assigned = r.slot; break; }
    if (assigned && slots[assigned] == null) slots[assigned] = l.valueMm;
    prevEnd = l.index + l.raw.length;
  }
  const leftovers = lengths.filter(
    (l) => l.valueMm !== slots.heightMm && l.valueMm !== slots.widthMm && l.valueMm !== slots.depthMm,
  );
  for (const l of leftovers) {
    if (l.valueMm >= 700 && slots.heightMm == null) slots.heightMm = l.valueMm;
    else if (l.valueMm >= 400 && slots.widthMm == null) slots.widthMm = l.valueMm;
    else if (l.valueMm >= 150 && l.valueMm < 400 && slots.depthMm == null) slots.depthMm = l.valueMm;
  }
  return slots;
}

function parseShelves(text: string) {
  const m = /(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\s*(?:fixed\s+)?(?:shelves|shelf|levels|tiers)\b/i.exec(text);
  if (!m) return null;
  const raw = m[1].toLowerCase();
  return NUMBER_WORDS[raw] ?? parseInt(raw, 10);
}

function parseBudget(text: string) {
  const m = /(?:under|below|less than|max|budget of|around|about)?\s*[$£€]\s?(\d+(?:[.,]\d+)?)/i.exec(text);
  if (m) return { value: parseFloat(m[1].replace(",", ".")), raw: m[0].trim() };
  const m2 = /(?:under|below|less than|budget)\s+(\d+)\s*(?:dollars|bucks|aud)/i.exec(text);
  if (m2) return { value: parseFloat(m2[1]), raw: m2[0].trim() };
  return null;
}

function parseThickness(text: string) {
  const m = /\b(12|15|18|20|21|22|25|30|40)\s*mm(?:\s*(?:ply|stock|thick(?:ness)?))?\b/i.exec(text);
  if (!m) return null;
  return parseInt(m[1], 10);
}

export function parseIntent(text: string): Intent {
  const clean = String(text || "").trim();
  const lower = clean.toLowerCase();
  const lengths = parseLengths(clean);
  const kind = KINDS.find((k) => k.re.test(clean)) || { id: "unknown" as KindId, template: "generic" };
  const materialHit = MATERIAL_HINTS.find((m) => m.re.test(clean));
  const constraints: Intent["constraints"] = {};
  for (const rule of PROFILE_RULES) {
    if (rule.re.test(clean)) constraints[rule.id] = { active: true, label: rule.label };
  }
  const money = parseBudget(clean);
  const budget = money ? money.value : null;
  const dims = assignDimensions(clean, lengths);
  const explicitShelves = parseShelves(clean);
  const thickness = parseThickness(clean);

  const isTable = kind.id === "table";
  const priorities = {
    storage: constraints.storage ? 95 : isTable ? 20 : 60,
    cost: constraints.cost ? 90 : budget ? 85 : 40,
    sustainability: constraints.sustainability ? 80 : 30,
    safety: constraints.safety ? 90 : 50,
    aesthetics: constraints.aesthetic ? 70 : 40,
    portability: constraints.knockdown ? 80 : 20,
    fit: constraints.space ? 90 : 60,
  };
  if (dims.heightMm && dims.heightMm < 1200) priorities.fit = Math.max(priorities.fit, 75);
  if (constraints.weight) priorities.portability = Math.max(priorities.portability, 75);

  const slots: Intent["slots"] = {
    widthMm: { value: dims.widthMm ?? (isTable ? 1400 : 900), source: dims.widthMm ? "user" : "default" },
    heightMm: { value: dims.heightMm ?? (isTable ? 750 : 1800), source: dims.heightMm ? "user" : "default" },
    depthMm: { value: dims.depthMm ?? (isTable ? 750 : 300), source: dims.depthMm ? "user" : "default" },
    shelves: { value: explicitShelves ?? (isTable ? 1 : 5), source: explicitShelves ? "user" : "default" },
    material: { value: materialHit ? materialHit.id : "birch-plywood", source: materialHit ? "user" : "default" },
    budget: { value: budget, source: budget ? "user" : "absent" },
    anchored: { value: !!constraints.safety, source: constraints.safety ? "user" : "default" },
    knockdown: { value: !!constraints.knockdown, source: constraints.knockdown ? "user" : "default" },
    loadPerShelfKg: { value: isTable ? 40 : 25, source: "default" },
    thicknessMm: { value: thickness ?? 18, source: thickness ? "user" : "default" },
  };

  const userSlots = Object.values(slots).filter((s) => s.source === "user").length;
  const totalSlots = Object.keys(slots).length;
  const confidence = Math.round((userSlots / totalSlots) * 100) / 100;

  const openQuestions = Object.entries(slots)
    .filter(([, s]) => s.source === "default")
    .map(([k, s]) => ({ slot: k, assumed: s.value, question: questionFor(k, s.value) }));

  const modifications: Intent["modifications"] = [];
  if (/\b(taller|make it higher|increase the height|raise the top)\b/i.test(lower)) modifications.push({ slot: "heightMm", delta: +150 });
  if (/\b(shorter|make it lower|reduce the height|less tall)\b/i.test(lower)) modifications.push({ slot: "heightMm", delta: -150 });
  if (/\b(wider|widen it|make it wider)\b/i.test(lower)) modifications.push({ slot: "widthMm", delta: +150 });
  if (/\b(narrower|make it narrower|slimmer unit)\b/i.test(lower)) modifications.push({ slot: "widthMm", delta: -150 });
  if (/\b(deeper|more depth|increase the depth|deeper shelves)\b/i.test(lower)) modifications.push({ slot: "depthMm", delta: +50 });
  if (/\b(more shelves|another shelf|extra shelf|add a shelf)\b/i.test(lower)) modifications.push({ slot: "shelves", delta: +1 });
  if (/\b(fewer shelves|one less shelf|remove a shelf)\b/i.test(lower)) modifications.push({ slot: "shelves", delta: -1 });
  if (/\b(thicker|sturdier|stronger|beef it up)\b/i.test(lower)) modifications.push({ slot: "thicknessMm", delta: +3, qualitative: "requested thicker stock" });
  if (/\b(cheaper|cut the cost|reduce the cost|lower the cost|bring the cost down)\b/i.test(lower)) modifications.push({ slot: null, intent: "reduce-cost" });
  if (/\banchor/i.test(lower)) modifications.push({ slot: "anchored", intent: "anchor" });

  const location = /\b(here|this wall|this spot|this space|right here)\b/i.test(clean)
    ? "current_view"
    : /\bwall\b/i.test(clean)
      ? "wall"
      : "unspecified";

  return {
    utterance: clean,
    kind: kind.id,
    template: kind.template,
    location,
    slots,
    priorities,
    constraints,
    modifications,
    confidence,
    openQuestions,
    recognised: { dimensions: lengths.map((l) => l.raw), budgetRaw: money ? money.raw : null },
    graph: renderGraph(kind.id, slots, priorities),
  };
}

function questionFor(slot: string, assumed: unknown) {
  const map: Record<string, string> = {
    widthMm: `How wide should it be? Assuming ${assumed} mm.`,
    heightMm: `How tall should it be? Assuming ${assumed} mm.`,
    depthMm: `How deep should it be? Assuming ${assumed} mm.`,
    shelves: `How many horizontal panels? Assuming ${assumed}.`,
    material: `Which material? Assuming ${assumed}.`,
    budget: "Is there a budget? Without one, cost is tracked but not gated.",
    anchored: `Will this be fixed to the wall? Assuming ${assumed ? "yes" : "no"}.`,
    knockdown: `Does it need to flat-pack? Assuming ${assumed ? "yes" : "no"}.`,
    loadPerShelfKg: `How much weight per shelf? Assuming ${assumed} kg.`,
    thicknessMm: `What stock thickness? Assuming ${assumed} mm.`,
  };
  return map[slot] || `Confirm ${slot}.`;
}

function renderGraph(kindId: string, slots: Intent["slots"], priorities: Record<string, number>) {
  const top = Object.entries(priorities).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const entries = [
    `size ${slots.widthMm.value} × ${slots.heightMm.value} × ${slots.depthMm.value} mm (${slots.widthMm.source === "user" ? "stated" : "assumed"})`,
    `panels ${slots.shelves.value} (${slots.shelves.source === "user" ? "stated" : "assumed"})`,
    `material ${slots.material.value} (${slots.material.source === "user" ? "stated" : "assumed"})`,
    `stock ${slots.thicknessMm.value} mm (${slots.thicknessMm.source === "user" ? "stated" : "assumed"})`,
    ...top.map(([k, v]) => `${k} priority ${v}%`),
  ];
  const lines = [kindId.toUpperCase()];
  entries.forEach((e, i) => lines.push(`${i === entries.length - 1 ? "└─" : "├─"} ${e}`));
  return lines.join("\n");
}

export function applyModifications(spec: Spec, modifications: Intent["modifications"]) {
  const next: Spec = { ...spec };
  const applied: string[] = [];
  for (const mod of modifications) {
    if (mod.slot === "anchored" || mod.intent === "anchor") {
      next.anchored = true;
      applied.push("anchored: true");
      continue;
    }
    if (mod.slot && typeof mod.delta === "number" && mod.slot in next) {
      const key = mod.slot as keyof Spec;
      const before = next[key];
      if (typeof before === "number") {
        (next[key] as number) = Math.max(1, before + mod.delta);
        applied.push(`${mod.slot}: ${before} → ${next[key]}`);
      }
    } else if (mod.intent === "reduce-cost") {
      next.joinery = "dowel";
      next.backThicknessMm = 3;
      applied.push("reduced cost: dowel joinery and a thinner back panel");
    }
  }
  return { spec: next, applied };
}
