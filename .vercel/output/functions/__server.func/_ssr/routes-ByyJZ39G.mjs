import { i as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, r as Slot, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { a as DialogPortal, i as DialogOverlay, n as DialogClose, o as DialogTitle, r as DialogContent, t as Dialog } from "../_libs/@radix-ui/react-dialog+[...].mjs";
import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
import { a as Sparkles, c as Moon, d as Anchor, i as Square, l as Mic, n as WandSparkles, o as Save, s as PanelRight, t as X, u as Download } from "../_libs/lucide-react.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { t as create } from "../_libs/zustand.mjs";
import { i as SliderTrack, n as SliderRange, r as SliderThumb, t as Slider$1 } from "../_libs/@radix-ui/react-slider+[...].mjs";
import { i as Trigger, n as List, r as Root2, t as Content } from "../_libs/radix-ui__react-tabs.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-ByyJZ39G.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var EPS = 1e-6;
function fieldAt(nodes, x, y) {
	let f = 0;
	for (const n of nodes) {
		const dx = x - n.x;
		const dy = y - n.y;
		const d2 = dx * dx + dy * dy;
		f += (n.w ?? 1) * n.r * n.r / Math.max(d2, EPS);
	}
	return f;
}
function key(p) {
	return `${Math.round(p[0] * 1e4)}:${Math.round(p[1] * 1e4)}`;
}
function stitch(segments) {
	const byStart = /* @__PURE__ */ new Map();
	segments.forEach((s, i) => {
		const k = key(s[0]);
		if (!byStart.has(k)) byStart.set(k, []);
		byStart.get(k).push(i);
	});
	const used = new Array(segments.length).fill(false);
	const polylines = [];
	for (let i = 0; i < segments.length; i++) {
		if (used[i]) continue;
		used[i] = true;
		const line = [segments[i][0], segments[i][1]];
		for (;;) {
			const nextIdx = (byStart.get(key(line[line.length - 1])) || []).find((c) => !used[c]);
			if (nextIdx === void 0) break;
			used[nextIdx] = true;
			line.push(segments[nextIdx][1]);
			if (key(line[line.length - 1]) === key(line[0])) break;
		}
		polylines.push(line);
	}
	polylines.sort((a, b) => b.length - a.length);
	return polylines;
}
function contour(nodes, { res = 64, threshold = 1 } = {}) {
	const step = 1 / res;
	const segments = [];
	const interp = (xa, ya, va, xb, yb, vb) => {
		const denom = vb - va;
		const t = Math.abs(denom) < EPS ? .5 : (threshold - va) / denom;
		return [xa + (xb - xa) * t, ya + (yb - ya) * t];
	};
	for (let i = 0; i < res; i++) for (let j = 0; j < res; j++) {
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
		const seg = {
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
			14: [bottom(), right()]
		}[idx];
		if (seg) segments.push(seg);
	}
	return stitch(segments);
}
function lcg(seed) {
	let s = seed >>> 0;
	return () => {
		s = 1664525 * s + 1013904223 >>> 0;
		return s / 4294967296;
	};
}
function amorphous(seed = 1, count = 14) {
	const rnd = lcg(seed);
	const nodes = [];
	for (let i = 0; i < count; i++) nodes.push({
		x: .15 + rnd() * .7,
		y: .1 + rnd() * .8,
		r: .06 + rnd() * .09,
		w: .6 + rnd() * .4
	});
	return {
		kind: "amorphous",
		nodes,
		seed
	};
}
function bookshelfShape(spec = {}) {
	const shelves = Math.max(2, spec.shelves ?? 5);
	const nodes = [];
	const R = .045;
	const nodesPerVertical = 9;
	for (const vx of [.16, .84]) for (let i = 0; i < nodesPerVertical; i++) {
		const t = i / 8;
		nodes.push({
			x: vx,
			y: .08 + t * .84,
			r: R,
			w: 1
		});
	}
	for (let i = 0; i < shelves; i++) {
		const y = .08 + (shelves === 1 ? .5 : i / (shelves - 1)) * .84;
		const nodesPerShelf = 7;
		for (let j = 0; j < nodesPerShelf; j++) {
			const u = j / 6;
			nodes.push({
				x: .16 + u * .68,
				y,
				r: R,
				w: 1
			});
		}
	}
	return {
		kind: "bookshelf",
		nodes
	};
}
function tableShape(spec = {}) {
	const nodes = [];
	const aspect = (spec.widthMm ?? 1400) / (spec.heightMm ?? 750);
	const topY = .28;
	const legInset = aspect > 1.6 ? .14 : .18;
	for (const vx of [legInset, 1 - legInset]) for (let i = 0; i < 5; i++) nodes.push({
		x: vx,
		y: .32 + i / 4 * .56,
		r: .045,
		w: 1
	});
	const topCount = 9;
	for (let j = 0; j < topCount; j++) nodes.push({
		x: .12 + j / 8 * .76,
		y: topY,
		r: .055,
		w: 1.1
	});
	return {
		kind: "table",
		nodes
	};
}
function genericBoxShape() {
	const nodes = [];
	for (const [x, y] of [
		[.2, .15],
		[.5, .1],
		[.8, .15],
		[.85, .5],
		[.8, .85],
		[.5, .9],
		[.2, .85],
		[.15, .5]
	]) nodes.push({
		x,
		y,
		r: .11,
		w: 1
	});
	return {
		kind: "generic",
		nodes
	};
}
function shapeForTemplate(template, spec) {
	switch (template) {
		case "bookshelf": return bookshelfShape(spec);
		case "table": return tableShape(spec);
		default: return genericBoxShape();
	}
}
function morph(from, to, t) {
	const n = Math.max(from.nodes.length, to.nodes.length);
	const nodes = [];
	for (let i = 0; i < n; i++) {
		const a = from.nodes[i];
		const b = to.nodes[i];
		const ax = a ? a.x : b.x;
		const ay = a ? a.y : b.y;
		const bx = b ? b.x : a.x;
		const by = b ? b.y : a.y;
		const ar = a ? a.r : 0;
		const br = b ? b.r : 0;
		const wobble = Math.sin(Math.PI * t) * .012;
		const aw = a ? a.w ?? 1 : 0;
		const bw = b ? b.w ?? 1 : 0;
		nodes.push({
			x: ax + (bx - ax) * t + Math.sin(i * 2.3) * wobble,
			y: ay + (by - ay) * t + Math.cos(i * 1.7) * wobble,
			r: ar + (br - ar) * t,
			w: aw + (bw - aw) * t
		});
	}
	return {
		kind: to.kind,
		nodes,
		progress: t
	};
}
function breathe(shape, timeSec, energy = 1) {
	const nodes = shape.nodes.map((n, i) => {
		const pulse = 1 + Math.sin(timeSec * 1.4 + i * .55) * .045 * energy;
		const drift = .008 * energy;
		return {
			...n,
			x: n.x + Math.sin(timeSec * .6 + i * 1.1) * drift,
			y: n.y + Math.cos(timeSec * .5 + i * .9) * drift,
			r: n.r * pulse
		};
	});
	return {
		...shape,
		nodes
	};
}
function rectilinearPlan(cutList) {
	const { spec } = cutList;
	const t = spec.thicknessMm;
	if (spec.kind === "table") {
		Math.max(40, Math.min(90, Math.round(spec.depthMm * .1)));
		return {
			kind: "plan",
			units: "mm",
			widthMm: spec.widthMm,
			heightMm: spec.heightMm,
			depthMm: spec.depthMm,
			rects: [
				{
					id: "top",
					x: 0,
					y: spec.heightMm - t,
					w: spec.widthMm,
					h: t,
					kind: "top"
				},
				{
					id: "leg-L",
					x: 0,
					y: 0,
					w: t,
					h: spec.heightMm - t,
					kind: "leg"
				},
				{
					id: "leg-R",
					x: spec.widthMm - t,
					y: 0,
					w: t,
					h: spec.heightMm - t,
					kind: "leg"
				},
				{
					id: "apron",
					x: t,
					y: spec.heightMm - t - 90,
					w: spec.widthMm - 2 * t,
					h: 20,
					kind: "apron"
				}
			]
		};
	}
	const rects = [];
	rects.push({
		id: "side-L",
		x: 0,
		y: 0,
		w: t,
		h: spec.heightMm,
		kind: "side"
	});
	rects.push({
		id: "side-R",
		x: spec.widthMm - t,
		y: 0,
		w: t,
		h: spec.heightMm,
		kind: "side"
	});
	for (let i = 0; i < spec.shelves; i++) {
		const y = i * ((spec.heightMm - t) / Math.max(1, spec.shelves - 1));
		rects.push({
			id: `shelf-${i + 1}`,
			x: t,
			y: Math.min(y, spec.heightMm - t),
			w: spec.widthMm - 2 * t,
			h: t,
			kind: "shelf"
		});
	}
	if (spec.plinth) rects.push({
		id: "plinth",
		x: t,
		y: 0,
		w: spec.widthMm - 2 * t,
		h: spec.plinthHeightMm,
		kind: "plinth"
	});
	return {
		kind: "plan",
		units: "mm",
		widthMm: spec.widthMm,
		heightMm: spec.heightMm,
		depthMm: spec.depthMm,
		rects
	};
}
function elevations(cutList) {
	const { spec } = cutList;
	const t = spec.thicknessMm;
	const shelfYs = [];
	for (let i = 0; i < spec.shelves; i++) {
		const y = i * ((spec.heightMm - t) / Math.max(1, spec.shelves - 1));
		shelfYs.push(Math.min(y, spec.heightMm - t));
	}
	return {
		front: {
			widthMm: spec.widthMm,
			heightMm: spec.heightMm,
			shelfYs,
			thicknessMm: t
		},
		side: {
			widthMm: spec.depthMm,
			heightMm: spec.heightMm,
			shelfYs,
			thicknessMm: t
		},
		clearBaysMm: shelfYs.slice(1).map((y, i) => Math.round(y - (shelfYs[i] + t)))
	};
}
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function round1(n) {
	return Math.round(n * 10) / 10;
}
function round2(n) {
	return Math.round(n * 100) / 100;
}
function round3(n) {
	return Math.round(n * 1e3) / 1e3;
}
function clamp(n, lo = 0, hi = 100) {
	return Math.max(lo, Math.min(hi, n));
}
function formatMoney(n, currency) {
	try {
		return new Intl.NumberFormat("en-AU", {
			style: "currency",
			currency,
			maximumFractionDigits: 2
		}).format(n);
	} catch {
		return `${currency} ${n.toFixed(2)}`;
	}
}
function downloadText(filename, contents, mime = "text/plain") {
	const blob = new Blob([contents], { type: mime });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	a.click();
	URL.revokeObjectURL(url);
}
var GRAVITY = 9.81;
function secondMomentOfArea(depthMm, thicknessMm) {
	return depthMm * Math.pow(thicknessMm, 3) / 12;
}
function lineLoadNPerMm(totalKg, spanMm) {
	return totalKg * GRAVITY / spanMm;
}
function immediateDeflectionMm({ loadKg, spanMm, E, depthMm, thicknessMm }) {
	const I = secondMomentOfArea(depthMm, thicknessMm);
	return 5 * lineLoadNPerMm(loadKg, spanMm) * Math.pow(spanMm, 4) / (384 * E * I);
}
function shelfCheck({ loadKg, selfMassKg = 0, spanMm, material, thicknessMm, depthMm, creepFactor = 2, ratioDivisor = 360 }) {
	const totalKg = loadKg + selfMassKg;
	const immediateMm = immediateDeflectionMm({
		loadKg: totalKg,
		spanMm,
		E: material.E,
		depthMm,
		thicknessMm
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
		totalLoadKg: round3(totalKg)
	};
}
function tipOverCheck({ massKg, depthMm, heightMm, pushForceN = 200, payloadMassKg = 0, payloadHeightMm = null, rearDropMm = 0 }) {
	const pushHeight = payloadHeightMm ?? heightMm * .9;
	const tiltRad = rearDropMm > 0 ? Math.atan(rearDropMm / depthMm) : 0;
	const comHeightMm = heightMm / 2;
	const comShiftMm = rearDropMm > 0 ? comHeightMm * Math.sin(tiltRad) : 0;
	const overturningMoment = pushForceN * (pushHeight / 1e3);
	const restoringMoment = (massKg + payloadMassKg) * GRAVITY * (depthMm / 1e3 / 2 + comShiftMm / 1e3);
	const margin = restoringMoment / overturningMoment;
	return {
		overturningMomentNm: round3(overturningMoment),
		restoringMomentNm: round3(restoringMoment),
		margin: round3(margin),
		rearDropMm,
		tiltDeg: round3(tiltRad * 180 / Math.PI),
		comShiftMm: round3(comShiftMm),
		pass: margin >= 1,
		anchoredRequired: margin < 1
	};
}
function rackingCheck({ hasBackPanel, hasBraces }) {
	if (hasBackPanel) return {
		pass: true,
		mechanism: "fixed back panel acts as a shear diaphragm"
	};
	if (hasBraces) return {
		pass: true,
		mechanism: "diagonal braces"
	};
	return {
		pass: false,
		mechanism: "none",
		action: "add a fixed back panel or diagonal braces; unsupported rectangular boxes rack under load"
	};
}
/** Visual sag at year T using the same creep model (K grows from 1 toward 2). */
function agedSagMm(immediateMm, years) {
	return round3(immediateMm * (1 + Math.min(1, years / 10)));
}
var NUMBER_WORDS = {
	one: 1,
	two: 2,
	three: 3,
	four: 4,
	five: 5,
	six: 6,
	seven: 7,
	eight: 8,
	nine: 9,
	ten: 10
};
var LENGTH_UNITS_MM = {
	mm: 1,
	millimetre: 1,
	centimetre: 10,
	cm: 10,
	m: 1e3,
	metre: 1e3,
	meter: 1e3,
	in: 25.4,
	inch: 25.4,
	inches: 25.4,
	"\"": 25.4,
	ft: 304.8,
	foot: 304.8,
	feet: 304.8
};
var KINDS = [
	{
		id: "bookshelf",
		re: /\b(book ?shelf|bookcase|shelving|shelf|shelves|bookshelf)\b/i,
		template: "bookshelf"
	},
	{
		id: "table",
		re: /\b(table|desk|bench|workbench)\b/i,
		template: "table"
	},
	{
		id: "frame",
		re: /\b(frame|rack|stand|mount|cradle|enclosure|box)\b/i,
		template: "frame"
	},
	{
		id: "ui",
		re: /\b(app|ui|interface|widget|screen|dashboard)\b/i,
		template: "ui"
	},
	{
		id: "concept",
		re: /\b(theory|concept|simulation|physics|model)\b/i,
		template: "concept"
	}
];
var MATERIAL_HINTS = [
	{
		re: /\b(birch|plywood|ply)\b/i,
		id: "birch-plywood"
	},
	{
		re: /\b(mdf|fibreboard|particleboard|chipboard)\b/i,
		id: "mdf"
	},
	{
		re: /\b(pine|solid wood|timber|oak|softwood|hardwood)\b/i,
		id: "solid-pine"
	},
	{
		re: /\b(bamboo)\b/i,
		id: "bamboo"
	},
	{
		re: /\b(steel|metal|iron)\b/i,
		id: "steel-mild"
	},
	{
		re: /\b(aluminium|aluminum)\b/i,
		id: "aluminium"
	}
];
var PROFILE_RULES = [
	{
		id: "cost",
		label: "Minimise cost",
		re: /\b(cheap|cheapest|budget|low cost|affordable|as little as possible|tight budget)\b/i
	},
	{
		id: "storage",
		label: "Maximise storage",
		re: /\b(as much storage as possible|maximi[sz]e storage|lots of storage|fit as many books|storage)\b/i
	},
	{
		id: "space",
		label: "Fit a small space",
		re: /\b(small apartment|tiny room|narrow space|small space|studio flat|tight space|corner)\b/i
	},
	{
		id: "safety",
		label: "Child / seismic safety",
		re: /\b(child|kid|toddler|baby|earthquake|seismic|safe|safety|tip[- ]?over|anchor|fix(?:ed)? to the wall|anti[- ]?tip)\b/i
	},
	{
		id: "sustainability",
		label: "Sustainability",
		re: /\b(reclaimed|sustainab|eco|recycled|low carbon|environment)\b/i
	},
	{
		id: "aesthetic",
		label: "Aesthetic direction",
		re: /\b(futuristic|modern|minimal|industrial|scandinavian|rustic|sleek|statement)\b/i
	},
	{
		id: "knockdown",
		label: "Must flat-pack / re-assemble",
		re: /\b(flat[- ]?pack|knock[- ]?down|take it apart|move house|demount)\b/i
	},
	{
		id: "weight",
		label: "Keep it light",
		re: /\b(light|lightweight|easy to move|one person)\b/i
	}
];
function parseLengths(text) {
	const out = [];
	const re = /(\d+(?:[.,]\d+)?|one|two|three|four|five|six|seven|eight|nine|ten)\s*(?:(mm|millimetres?|cm|m|metres?|meters?|inches|inch|in|ft|feet|foot)\b|("))/gi;
	let m;
	while ((m = re.exec(text)) !== null) {
		const raw = m[1].toLowerCase();
		const value = NUMBER_WORDS[raw] ?? parseFloat(raw.replace(",", "."));
		const unitRaw = m[2] ? m[2].toLowerCase() : "\"";
		const factor = LENGTH_UNITS_MM[unitRaw.replace(/s$/, "")] ?? LENGTH_UNITS_MM[unitRaw] ?? 1;
		out.push({
			valueMm: Math.round(value * factor),
			raw: m[0].trim(),
			unit: unitRaw,
			index: m.index
		});
	}
	const bare = /(?<![\d.])(\d{2,5})\s*(tall|high|height|wide|width|deep|depth|long|length)\b/gi;
	while ((m = bare.exec(text)) !== null) {
		const hit = m;
		const valueMm = parseInt(hit[1], 10);
		if (!out.some((o) => o.index === hit.index || o.valueMm === valueMm)) out.push({
			valueMm,
			raw: hit[0].trim(),
			unit: "assumed-mm",
			index: hit.index
		});
	}
	out.sort((a, b) => a.index - b.index);
	return out;
}
function assignDimensions(text, lengths) {
	const slots = {
		widthMm: null,
		heightMm: null,
		depthMm: null
	};
	const rules = [
		{
			slot: "heightMm",
			re: /(tall|high|height)/
		},
		{
			slot: "widthMm",
			re: /(wide|width|across|long|length)/
		},
		{
			slot: "depthMm",
			re: /(deep|depth)/
		}
	];
	let prevEnd = 0;
	for (const l of lengths) {
		const raw = l.raw.toLowerCase();
		const after = text.slice(l.index + l.raw.length, l.index + l.raw.length + 14).toLowerCase();
		const gapBefore = text.slice(Math.max(prevEnd, l.index - 20), l.index).toLowerCase();
		let assigned = null;
		for (const r of rules) if (r.re.test(raw)) {
			assigned = r.slot;
			break;
		}
		if (!assigned) {
			for (const r of rules) if (r.re.test(after)) {
				assigned = r.slot;
				break;
			}
		}
		if (!assigned) {
			for (const r of rules) if (r.re.test(gapBefore)) {
				assigned = r.slot;
				break;
			}
		}
		if (assigned && slots[assigned] == null) slots[assigned] = l.valueMm;
		prevEnd = l.index + l.raw.length;
	}
	const leftovers = lengths.filter((l) => l.valueMm !== slots.heightMm && l.valueMm !== slots.widthMm && l.valueMm !== slots.depthMm);
	for (const l of leftovers) if (l.valueMm >= 700 && slots.heightMm == null) slots.heightMm = l.valueMm;
	else if (l.valueMm >= 400 && slots.widthMm == null) slots.widthMm = l.valueMm;
	else if (l.valueMm >= 150 && l.valueMm < 400 && slots.depthMm == null) slots.depthMm = l.valueMm;
	return slots;
}
function parseShelves(text) {
	const m = /(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\s*(?:fixed\s+)?(?:shelves|shelf|levels|tiers)\b/i.exec(text);
	if (!m) return null;
	const raw = m[1].toLowerCase();
	return NUMBER_WORDS[raw] ?? parseInt(raw, 10);
}
function parseBudget(text) {
	const m = /(?:under|below|less than|max|budget of|around|about)?\s*[$£€]\s?(\d+(?:[.,]\d+)?)/i.exec(text);
	if (m) return {
		value: parseFloat(m[1].replace(",", ".")),
		raw: m[0].trim()
	};
	const m2 = /(?:under|below|less than|budget)\s+(\d+)\s*(?:dollars|bucks|aud)/i.exec(text);
	if (m2) return {
		value: parseFloat(m2[1]),
		raw: m2[0].trim()
	};
	return null;
}
function parseThickness(text) {
	const m = /\b(12|15|18|20|21|22|25|30|40)\s*mm(?:\s*(?:ply|stock|thick(?:ness)?))?\b/i.exec(text);
	if (!m) return null;
	return parseInt(m[1], 10);
}
function parseIntent(text) {
	const clean = String(text || "").trim();
	const lower = clean.toLowerCase();
	const lengths = parseLengths(clean);
	const kind = KINDS.find((k) => k.re.test(clean)) || {
		id: "unknown",
		template: "generic"
	};
	const materialHit = MATERIAL_HINTS.find((m) => m.re.test(clean));
	const constraints = {};
	for (const rule of PROFILE_RULES) if (rule.re.test(clean)) constraints[rule.id] = {
		active: true,
		label: rule.label
	};
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
		fit: constraints.space ? 90 : 60
	};
	if (dims.heightMm && dims.heightMm < 1200) priorities.fit = Math.max(priorities.fit, 75);
	if (constraints.weight) priorities.portability = Math.max(priorities.portability, 75);
	const slots = {
		widthMm: {
			value: dims.widthMm ?? (isTable ? 1400 : 900),
			source: dims.widthMm ? "user" : "default"
		},
		heightMm: {
			value: dims.heightMm ?? (isTable ? 750 : 1800),
			source: dims.heightMm ? "user" : "default"
		},
		depthMm: {
			value: dims.depthMm ?? (isTable ? 750 : 300),
			source: dims.depthMm ? "user" : "default"
		},
		shelves: {
			value: explicitShelves ?? (isTable ? 1 : 5),
			source: explicitShelves ? "user" : "default"
		},
		material: {
			value: materialHit ? materialHit.id : "birch-plywood",
			source: materialHit ? "user" : "default"
		},
		budget: {
			value: budget,
			source: budget ? "user" : "absent"
		},
		anchored: {
			value: !!constraints.safety,
			source: constraints.safety ? "user" : "default"
		},
		knockdown: {
			value: !!constraints.knockdown,
			source: constraints.knockdown ? "user" : "default"
		},
		loadPerShelfKg: {
			value: isTable ? 40 : 25,
			source: "default"
		},
		thicknessMm: {
			value: thickness ?? 18,
			source: thickness ? "user" : "default"
		}
	};
	const userSlots = Object.values(slots).filter((s) => s.source === "user").length;
	const totalSlots = Object.keys(slots).length;
	const confidence = Math.round(userSlots / totalSlots * 100) / 100;
	const openQuestions = Object.entries(slots).filter(([, s]) => s.source === "default").map(([k, s]) => ({
		slot: k,
		assumed: s.value,
		question: questionFor(k, s.value)
	}));
	const modifications = [];
	if (/\b(taller|make it higher|increase the height|raise the top)\b/i.test(lower)) modifications.push({
		slot: "heightMm",
		delta: 150
	});
	if (/\b(shorter|make it lower|reduce the height|less tall)\b/i.test(lower)) modifications.push({
		slot: "heightMm",
		delta: -150
	});
	if (/\b(wider|widen it|make it wider)\b/i.test(lower)) modifications.push({
		slot: "widthMm",
		delta: 150
	});
	if (/\b(narrower|make it narrower|slimmer unit)\b/i.test(lower)) modifications.push({
		slot: "widthMm",
		delta: -150
	});
	if (/\b(deeper|more depth|increase the depth|deeper shelves)\b/i.test(lower)) modifications.push({
		slot: "depthMm",
		delta: 50
	});
	if (/\b(more shelves|another shelf|extra shelf|add a shelf)\b/i.test(lower)) modifications.push({
		slot: "shelves",
		delta: 1
	});
	if (/\b(fewer shelves|one less shelf|remove a shelf)\b/i.test(lower)) modifications.push({
		slot: "shelves",
		delta: -1
	});
	if (/\b(thicker|sturdier|stronger|beef it up)\b/i.test(lower)) modifications.push({
		slot: "thicknessMm",
		delta: 3,
		qualitative: "requested thicker stock"
	});
	if (/\b(cheaper|cut the cost|reduce the cost|lower the cost|bring the cost down)\b/i.test(lower)) modifications.push({
		slot: null,
		intent: "reduce-cost"
	});
	if (/\banchor/i.test(lower)) modifications.push({
		slot: "anchored",
		intent: "anchor"
	});
	const location = /\b(here|this wall|this spot|this space|right here)\b/i.test(clean) ? "current_view" : /\bwall\b/i.test(clean) ? "wall" : "unspecified";
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
		recognised: {
			dimensions: lengths.map((l) => l.raw),
			budgetRaw: money ? money.raw : null
		},
		graph: renderGraph(kind.id, slots, priorities)
	};
}
function questionFor(slot, assumed) {
	return {
		widthMm: `How wide should it be? Assuming ${assumed} mm.`,
		heightMm: `How tall should it be? Assuming ${assumed} mm.`,
		depthMm: `How deep should it be? Assuming ${assumed} mm.`,
		shelves: `How many horizontal panels? Assuming ${assumed}.`,
		material: `Which material? Assuming ${assumed}.`,
		budget: "Is there a budget? Without one, cost is tracked but not gated.",
		anchored: `Will this be fixed to the wall? Assuming ${assumed ? "yes" : "no"}.`,
		knockdown: `Does it need to flat-pack? Assuming ${assumed ? "yes" : "no"}.`,
		loadPerShelfKg: `How much weight per shelf? Assuming ${assumed} kg.`,
		thicknessMm: `What stock thickness? Assuming ${assumed} mm.`
	}[slot] || `Confirm ${slot}.`;
}
function renderGraph(kindId, slots, priorities) {
	const top = Object.entries(priorities).sort((a, b) => b[1] - a[1]).slice(0, 5);
	const entries = [
		`size ${slots.widthMm.value} × ${slots.heightMm.value} × ${slots.depthMm.value} mm (${slots.widthMm.source === "user" ? "stated" : "assumed"})`,
		`panels ${slots.shelves.value} (${slots.shelves.source === "user" ? "stated" : "assumed"})`,
		`material ${slots.material.value} (${slots.material.source === "user" ? "stated" : "assumed"})`,
		`stock ${slots.thicknessMm.value} mm (${slots.thicknessMm.source === "user" ? "stated" : "assumed"})`,
		...top.map(([k, v]) => `${k} priority ${v}%`)
	];
	const lines = [kindId.toUpperCase()];
	entries.forEach((e, i) => lines.push(`${i === entries.length - 1 ? "└─" : "├─"} ${e}`));
	return lines.join("\n");
}
function applyModifications(spec, modifications) {
	const next = { ...spec };
	const applied = [];
	for (const mod of modifications) {
		if (mod.slot === "anchored" || mod.intent === "anchor") {
			next.anchored = true;
			applied.push("anchored: true");
			continue;
		}
		if (mod.slot && typeof mod.delta === "number" && mod.slot in next) {
			const key = mod.slot;
			const before = next[key];
			if (typeof before === "number") {
				next[key] = Math.max(1, before + mod.delta);
				applied.push(`${mod.slot}: ${before} → ${next[key]}`);
			}
		} else if (mod.intent === "reduce-cost") {
			next.joinery = "dowel";
			next.backThicknessMm = 3;
			applied.push("reduced cost: dowel joinery and a thinner back panel");
		}
	}
	return {
		spec: next,
		applied
	};
}
var MATERIALS = {
	"birch-plywood": {
		id: "birch-plywood",
		label: "Full-birch plywood (interior/exterior glue)",
		E: 10300,
		density: 680,
		thicknessesMm: [
			12,
			15,
			18,
			21,
			25
		],
		verified: false,
		source: null,
		provenance: "Typical handbook value for plywood bending MOE (approx. 1.5e6 psi).",
		grainSensitive: true,
		notes: "Cut across face grain for narrow shelves; grain runs along the long dimension of a panel."
	},
	"poplar-plywood": {
		id: "poplar-plywood",
		label: "Poplar-core plywood / hardwood ply",
		E: 8600,
		density: 600,
		thicknessesMm: [
			12,
			15,
			18,
			21,
			25
		],
		verified: false,
		source: null,
		provenance: "Typical handbook value for soft-core plywood, lower stiffness than full birch.",
		grainSensitive: true,
		notes: "Cheaper, less stiff, better screw holding than MDF."
	},
	mdf: {
		id: "mdf",
		label: "MDF (medium-density fibreboard)",
		E: 3600,
		density: 750,
		thicknessesMm: [
			12,
			15,
			18,
			22,
			25
		],
		verified: false,
		source: null,
		provenance: "Typical handbook value for MDF bending MOE.",
		grainSensitive: false,
		notes: "No grain direction. Poor screw holding in edge; use confirmat/cam-dowel or biscuits."
	},
	"solid-pine": {
		id: "solid-pine",
		label: "Solid pine / softwood timber",
		E: 1e4,
		density: 510,
		thicknessesMm: [
			18,
			20,
			25,
			30,
			40
		],
		verified: false,
		source: null,
		provenance: "Typical handbook value for softwood timber bending MOE.",
		grainSensitive: true,
		notes: "Moves with humidity. Allow for seasonal movement; do not glue a wide panel to a cross rail."
	},
	bamboo: {
		id: "bamboo",
		label: "Bamboo laminate / strand board",
		E: 12e3,
		density: 700,
		thicknessesMm: [
			15,
			18,
			20,
			25
		],
		verified: false,
		source: null,
		provenance: "Typical reported range for bamboo laminate; varies widely by strand orientation.",
		grainSensitive: true,
		notes: "Higher stiffness per mm than plywood in the fibre direction; verify orientation."
	},
	"steel-mild": {
		id: "steel-mild",
		label: "Mild steel (S235 / A36 class)",
		E: 2e5,
		density: 7850,
		thicknessesMm: [
			1.5,
			2,
			3,
			4,
			6
		],
		verified: false,
		source: null,
		provenance: "Standard handbook value for mild steel.",
		grainSensitive: false,
		notes: "Dominated by weight and finishing cost for furniture. Check the mass trade-off."
	},
	aluminium: {
		id: "aluminium",
		label: "Aluminium (6061-T6 class)",
		E: 69e3,
		density: 2700,
		thicknessesMm: [
			1.5,
			2,
			3,
			5,
			6
		],
		verified: false,
		source: null,
		provenance: "Standard handbook value for 6061-T6.",
		grainSensitive: false,
		notes: "Roughly one third of steel stiffness but about a third of the weight."
	}
};
var ALIASES = {
	ply: "birch-plywood",
	plywood: "birch-plywood",
	birch: "birch-plywood",
	"birch ply": "birch-plywood",
	timber: "solid-pine",
	wood: "solid-pine",
	pine: "solid-pine",
	fibreboard: "mdf",
	steel: "steel-mild",
	aluminum: "aluminium",
	aluminium: "aluminium",
	bamboo: "bamboo",
	mdf: "mdf",
	oak: "solid-pine"
};
function resolveMaterial(nameOrId) {
	if (!nameOrId) return MATERIALS["birch-plywood"];
	const key = String(nameOrId).trim().toLowerCase();
	if (key in MATERIALS) return MATERIALS[key];
	if (ALIASES[key]) return MATERIALS[ALIASES[key]];
	for (const m of Object.values(MATERIALS)) if (m.label.toLowerCase().includes(key)) return m;
	return MATERIALS["birch-plywood"];
}
function nearestThickness(material, requestedMm) {
	if (!requestedMm) return material.thicknessesMm.includes(18) ? 18 : material.thicknessesMm[0];
	let best = material.thicknessesMm[0];
	for (const t of material.thicknessesMm) if (Math.abs(t - requestedMm) < Math.abs(best - requestedMm)) best = t;
	return best;
}
function boardMassKg(material, thicknessMm, widthMm, lengthMm) {
	return thicknessMm / 1e3 * (widthMm / 1e3) * (lengthMm / 1e3) * material.density;
}
function alternativesFor(materialId) {
	const primary = resolveMaterial(materialId);
	const out = [];
	for (const m of Object.values(MATERIALS)) {
		if (m.id === primary.id) continue;
		const stiffnessRatio = m.E / primary.E;
		const massRatio = m.density / primary.density;
		out.push({
			id: m.id,
			label: m.label,
			stiffnessVsPrimary: Number(stiffnessRatio.toFixed(2)),
			massVsPrimary: Number(massRatio.toFixed(2)),
			reason: stiffnessRatio > 1.05 && massRatio < 1.05 ? "stiffer and lighter" : stiffnessRatio > 1.05 ? "stiffer but heavier" : stiffnessRatio < .95 && massRatio < .95 ? "lighter but less stiff" : "similar stiffness, different cost/finish profile"
		});
	}
	return out.sort((a, b) => b.stiffnessVsPrimary - a.stiffnessVsPrimary);
}
function overlaps(a, b) {
	return !(a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.h <= b.y || b.y + b.h <= a.y);
}
function splitFree(existing, used) {
	const out = [];
	for (const f of existing) {
		if (!overlaps(f, used)) {
			out.push(f);
			continue;
		}
		if (used.x > f.x) out.push({
			x: f.x,
			y: f.y,
			w: used.x - f.x,
			h: f.h
		});
		if (used.x + used.w < f.x + f.w) out.push({
			x: used.x + used.w,
			y: f.y,
			w: f.x + f.w - (used.x + used.w),
			h: f.h
		});
		if (used.y > f.y) out.push({
			x: f.x,
			y: f.y,
			w: f.w,
			h: used.y - f.y
		});
		if (used.y + used.h < f.y + f.h) out.push({
			x: f.x,
			y: used.y + used.h,
			w: f.w,
			h: f.y + f.h - (used.y + used.h)
		});
	}
	return out.filter((r, i) => r.w > .001 && r.h > .001 && !out.some((o, j) => i !== j && o.x <= r.x && o.y <= r.y && o.x + o.w >= r.x + r.w && o.y + o.h >= r.y + r.h));
}
function tryFit(freeRects, w, h) {
	let best = null;
	for (const r of freeRects) if (r.w + .001 >= w && r.h + .001 >= h) {
		const score = [Math.min(r.w - w, r.h - h), Math.max(r.w - w, r.h - h)];
		if (!best || score[0] < best.score[0] || score[0] === best.score[0] && score[1] < best.score[1]) best = {
			rect: r,
			w,
			h,
			score
		};
	}
	return best;
}
function attemptPlace(sheetState, part) {
	const orientations = part.grainSensitive ? [[part.w, part.h]] : [[part.w, part.h], [part.h, part.w]];
	let best = null;
	for (const [w, h] of orientations) {
		const fit = tryFit(sheetState.freeRects, w, h);
		if (fit && (!best || fit.score[0] < best.fit.score[0])) best = {
			fit,
			w,
			h
		};
	}
	if (!best) return false;
	const { rect } = best.fit;
	const placedRect = {
		x: rect.x,
		y: rect.y,
		w: best.w,
		h: best.h
	};
	sheetState.freeRects = splitFree(sheetState.freeRects, placedRect);
	sheetState.placed.push({
		...part,
		x: rect.x,
		y: rect.y,
		placedW: best.w,
		placedH: best.h,
		rotated: best.w !== part.w
	});
	return true;
}
function packSheets(parts, sheet, options = {}) {
	const kerf = options.kerfMm ?? 0;
	const expanded = [];
	for (const p of parts) {
		const qty = p.qty ?? 1;
		for (let i = 0; i < qty; i++) expanded.push({
			id: `${p.id}#${i + 1}`,
			label: p.label,
			thicknessMm: p.thicknessMm,
			w: p.lengthMm + kerf,
			h: p.widthMm + kerf,
			realLengthMm: p.lengthMm,
			realWidthMm: p.widthMm,
			grainSensitive: !!p.grainSensitive
		});
	}
	expanded.sort((a, b) => b.w * b.h - a.w * a.h);
	const sheets = [];
	const unplaced = [];
	for (const part of expanded) {
		let placed = false;
		for (const s of sheets) if (attemptPlace(s, part)) {
			placed = true;
			break;
		}
		if (!placed) {
			const s = {
				index: sheets.length + 1,
				freeRects: [{
					x: 0,
					y: 0,
					w: sheet.lengthMm,
					h: sheet.widthMm
				}],
				placed: []
			};
			sheets.push(s);
			if (!attemptPlace(s, part)) unplaced.push(part);
		}
	}
	const sheetArea = sheet.lengthMm * sheet.widthMm;
	const result = sheets.map((s) => {
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
				rotated: p.rotated
			})),
			usedAreaMm2: Math.round(usedArea),
			utilisation: Number((usedArea / sheetArea).toFixed(3))
		};
	});
	const totalUsed = result.reduce((sum, s) => sum + s.usedAreaMm2, 0);
	return {
		sheet: {
			lengthMm: sheet.lengthMm,
			widthMm: sheet.widthMm
		},
		sheets: result,
		sheetCount: result.length,
		totalPartAreaMm2: totalUsed,
		overallUtilisation: Number((totalUsed / (sheetArea * Math.max(1, result.length))).toFixed(3)),
		unplaced
	};
}
var JOINERY = {
	"pocket-screw": {
		id: "pocket-screw",
		label: "Pocket screws (angled, jig-drilled)",
		needsThicknessMm: 15,
		suits: [
			"birch-plywood",
			"poplar-plywood",
			"solid-pine",
			"bamboo"
		],
		tooling: [
			"pocket-hole jig",
			"step drill bit",
			"driver bit",
			"clamp"
		],
		fastener: {
			id: "pocket-screw-32",
			label: "Pocket-hole screw 32 mm (coarse, washer head)",
			lengthMm: 32
		},
		spacingMm: 100,
		edgeDistanceMm: 32,
		reason: "Fast, strong in plywood and solid timber, fully demountable, needs no clamp-up time."
	},
	confirmat: {
		id: "confirmat",
		label: "Confirmat (furniture) screws",
		needsThicknessMm: 18,
		suits: [
			"mdf",
			"birch-plywood",
			"poplar-plywood"
		],
		tooling: [
			"5 mm pilot drill",
			"countersink or step drill",
			"driver bit"
		],
		fastener: {
			id: "confirmat-50",
			label: "Confirmat screw 7 x 50 mm",
			lengthMm: 50
		},
		spacingMm: 150,
		edgeDistanceMm: 34,
		reason: "Designed for engineered board; will not strip an MDF or particleboard edge."
	},
	dado: {
		id: "dado",
		label: "Dado / groove (housing joint)",
		needsThicknessMm: 12,
		suits: [
			"birch-plywood",
			"poplar-plywood",
			"mdf",
			"solid-pine"
		],
		tooling: [
			"router or table saw with dado stack",
			"straight cutter matched to panel thickness",
			"clamps"
		],
		fastener: {
			id: "glue-pva",
			label: "PVA wood glue (D3)",
			lengthMm: null
		},
		spacingMm: null,
		edgeDistanceMm: null,
		reason: "Locates the panel, adds glue area, and carries load through the full board thickness."
	},
	dowel: {
		id: "dowel",
		label: "Dowel joints",
		needsThicknessMm: 12,
		suits: [
			"birch-plywood",
			"solid-pine",
			"bamboo"
		],
		tooling: [
			"dowel jig or dowel centres",
			"8 mm brad-point bit",
			"mallet"
		],
		fastener: {
			id: "dowel-8x30",
			label: "Fluted dowel 8 x 30 mm",
			lengthMm: 30
		},
		spacingMm: 120,
		edgeDistanceMm: 24,
		reason: "Invisible joint, no fastener heads, good for glue-up of solid timber and plywood."
	},
	cam: {
		id: "cam",
		label: "Cam and dowel (knock-down)",
		needsThicknessMm: 18,
		suits: [
			"mdf",
			"birch-plywood",
			"poplar-plywood"
		],
		tooling: [
			"cam boring bit",
			"dowel drilling jig",
			"screwdriver"
		],
		fastener: {
			id: "cam-dowel-15",
			label: "15 mm cam lock + 24 mm dowel",
			lengthMm: 24
		},
		spacingMm: 192,
		edgeDistanceMm: 34,
		reason: "Flat-pack friendly: assembles with a screwdriver, ships flat, re-assembles after moving."
	}
};
function selectJoinery({ material, thicknessMm, requested, knockdown = false }) {
	const valid = Object.values(JOINERY).filter((j) => j.suits?.includes(material.id) && thicknessMm >= (j.needsThicknessMm ?? 0));
	if (requested && JOINERY[requested]) {
		const want = JOINERY[requested];
		if (valid.some((j) => j.id === want.id)) return {
			...want,
			selectedBecause: "user requested it and it is valid for this material and thickness",
			substituted: false
		};
		const replacement = valid[0];
		return {
			...replacement || want,
			selectedBecause: replacement ? `${want.label} is not suitable here; using ${replacement.label} instead.` : "no joint method in the library is valid for this material and thickness",
			substituted: true,
			requested: want.id
		};
	}
	const chosen = (knockdown ? valid.find((j) => j.id === "cam") : valid.find((j) => j.id === (material.id === "mdf" ? "confirmat" : "pocket-screw"))) || valid[0];
	if (!chosen) return {
		id: "none",
		label: "No valid joint",
		selectedBecause: "material/thickness combination is outside the joinery library",
		substituted: false
	};
	return {
		...chosen,
		selectedBecause: material.id === "mdf" && chosen.id === "confirmat" ? "MDF edge-screwing pulls out; confirmat screws are the engineered-board standard." : knockdown && chosen.id === "cam" ? "knock-down requested, so a cam-and-dowel joint assembles with a screwdriver." : `valid for ${material.label} at ${thicknessMm} mm and the fastest option that stays rigid.`,
		substituted: false
	};
}
function fastenerCountFor(lineLengthMm, joinery) {
	if (!joinery.spacingMm) return null;
	const usable = Math.max(0, lineLengthMm - 2 * (joinery.edgeDistanceMm || 0));
	return Math.max(2, Math.round(usable / joinery.spacingMm) + 1);
}
var DEFAULT_SHEET = {
	lengthMm: 2440,
	widthMm: 1220
};
var DEFAULT_SPEC = {
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
	bayClearMm: 0
};
function normaliseSpec(input = {}) {
	const spec = {
		...DEFAULT_SPEC,
		...input
	};
	const material = resolveMaterial(spec.material);
	spec.material = material.id;
	spec.thicknessMm = nearestThickness(material, spec.thicknessMm);
	if (spec.kind === "table") {
		spec.shelves = Math.max(1, Math.round(spec.shelves || 1));
		spec.plinth = false;
		spec.backPanel = false;
	} else spec.shelves = Math.max(2, Math.round(spec.shelves));
	spec.bayClearMm = round1((spec.heightMm - spec.shelves * spec.thicknessMm) / Math.max(1, spec.shelves - 1));
	return spec;
}
function emptyNest() {
	return {
		sheets: [],
		sheetCount: 0,
		overallUtilisation: 0,
		totalPartAreaMm2: 0,
		unplaced: [],
		sheet: DEFAULT_SHEET
	};
}
function buildCutList(specInput, options = {}) {
	const spec = normaliseSpec(specInput);
	if (spec.kind === "table") return buildTableCutList(spec, options);
	return buildCaseCutList(spec, options);
}
function buildCaseCutList(spec, options) {
	const material = resolveMaterial(spec.material);
	const sheet = options.sheet || DEFAULT_SHEET;
	const t = spec.thicknessMm;
	const span = spec.widthMm - 2 * t;
	const joinery = selectJoinery({
		material,
		thicknessMm: t,
		requested: spec.joinery,
		knockdown: spec.knockdown
	});
	const parts = [];
	const push = (p) => parts.push({
		grainSensitive: material.grainSensitive,
		...p
	});
	push({
		id: "side-L",
		label: "Side panel, left",
		qty: 1,
		lengthMm: spec.heightMm,
		widthMm: spec.depthMm,
		thicknessMm: t,
		edgesBanded: ["front"]
	});
	push({
		id: "side-R",
		label: "Side panel, right",
		qty: 1,
		lengthMm: spec.heightMm,
		widthMm: spec.depthMm,
		thicknessMm: t,
		edgesBanded: ["front"]
	});
	push({
		id: "shelf",
		label: `Shelf / horizontal panel (span ${span} mm)`,
		qty: spec.shelves,
		lengthMm: span,
		widthMm: spec.depthMm,
		thicknessMm: t,
		edgesBanded: ["front"],
		note: "Grain must run along the span. Do not rotate this part on the sheet."
	});
	if (spec.plinth) push({
		id: "plinth",
		label: `Front plinth rail (${spec.plinthHeightMm} mm)`,
		qty: 1,
		lengthMm: span,
		widthMm: spec.plinthHeightMm,
		thicknessMm: t,
		edgesBanded: ["top", "bottom"],
		grainSensitive: true
	});
	if (spec.backPanel) push({
		id: "back",
		label: `Back panel (${spec.backThicknessMm} mm)`,
		qty: 1,
		lengthMm: spec.heightMm,
		widthMm: spec.widthMm,
		thicknessMm: spec.backThicknessMm,
		material: "birch-plywood",
		edgesBanded: [],
		grainSensitive: false,
		separateSheet: true
	});
	const carcassParts = parts.filter((p) => !p.separateSheet);
	const backParts = parts.filter((p) => p.separateSheet);
	return finishCutList({
		spec,
		material,
		sheet,
		span,
		joinery,
		parts,
		carcassNest: packSheets(carcassParts, sheet, { kerfMm: options.kerfMm ?? 0 }),
		backNest: backParts.length ? packSheets(backParts, sheet, { kerfMm: options.kerfMm ?? 0 }) : emptyNest(),
		options
	});
}
function buildTableCutList(spec, options) {
	const material = resolveMaterial(spec.material);
	const sheet = options.sheet || DEFAULT_SHEET;
	const t = spec.thicknessMm;
	const leg = Math.max(40, Math.min(90, Math.round(spec.depthMm * .1)));
	const joinery = selectJoinery({
		material,
		thicknessMm: t,
		requested: spec.joinery,
		knockdown: spec.knockdown
	});
	const span = spec.widthMm - 2 * leg;
	const parts = [
		{
			id: "top",
			label: "Table top",
			qty: 1,
			lengthMm: spec.widthMm,
			widthMm: spec.depthMm,
			thicknessMm: t,
			edgesBanded: ["all"],
			grainSensitive: material.grainSensitive,
			note: "Grain along the long dimension."
		},
		{
			id: "leg",
			label: `Leg ${leg} × ${leg}`,
			qty: 4,
			lengthMm: spec.heightMm - t,
			widthMm: leg,
			thicknessMm: t,
			edgesBanded: [],
			grainSensitive: true
		},
		{
			id: "apron-long",
			label: "Long apron",
			qty: 2,
			lengthMm: spec.widthMm - 2 * leg,
			widthMm: 90,
			thicknessMm: t,
			edgesBanded: ["bottom"],
			grainSensitive: true
		},
		{
			id: "apron-short",
			label: "Short apron",
			qty: 2,
			lengthMm: spec.depthMm - 2 * leg,
			widthMm: 90,
			thicknessMm: t,
			edgesBanded: ["bottom"],
			grainSensitive: true
		}
	];
	return finishCutList({
		spec,
		material,
		sheet,
		span,
		joinery,
		parts,
		carcassNest: packSheets(parts, sheet, { kerfMm: options.kerfMm ?? 0 }),
		backNest: emptyNest(),
		options,
		depthForSag: spec.depthMm
	});
}
function finishCutList({ spec, material, sheet, span, joinery, parts, carcassNest, backNest, options, depthForSag }) {
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
		creepFactor: options.creepFactor ?? 2,
		ratioDivisor: options.ratioDivisor ?? 360
	});
	let remedy = null;
	const thickerOptions = material.thicknessesMm.filter((x) => x > t);
	if (!check.pass && thickerOptions.length) {
		const nextT = Math.min(...thickerOptions);
		const thicker = shelfCheck({
			loadKg: spec.loadPerShelfKg,
			selfMassKg: boardMassKg(material, nextT, depth, span),
			spanMm: span,
			material,
			thicknessMm: nextT,
			depthMm: depth
		});
		const midRail = shelfCheck({
			loadKg: spec.loadPerShelfKg,
			selfMassKg: shelfSelfMassKg,
			spanMm: span / 2,
			material,
			thicknessMm: t,
			depthMm: depth
		});
		const deep = shelfCheck({
			loadKg: spec.loadPerShelfKg,
			selfMassKg: boardMassKg(material, t, depth + 50, span),
			spanMm: span,
			material,
			thicknessMm: t,
			depthMm: depth + 50
		});
		remedy = {
			thickerSheetMm: nextT,
			thickerPasses: thicker.pass,
			thickerDeflectionMm: thicker.longTermMm,
			midRailAtHalfSpanPasses: midRail.pass,
			midRailDeflectionMm: midRail.longTermMm,
			deeperShelfMm: depth + 50,
			deeperShelfPasses: deep.pass,
			deeperShelfDeflectionMm: deep.longTermMm
		};
	}
	const carcassMassKg = parts.reduce((sum, p) => sum + boardMassKg(resolveMaterial(p.material || spec.material), p.thicknessMm, p.widthMm, p.lengthMm) * p.qty, 0);
	const tipArgs = {
		massKg: carcassMassKg,
		depthMm: spec.depthMm,
		heightMm: spec.heightMm,
		payloadMassKg: 0
	};
	const tipNoDrop = tipOverCheck({
		...tipArgs,
		rearDropMm: 0
	});
	const tip = tipOverCheck({
		...tipArgs,
		rearDropMm: spec.rearDropMm ?? 0
	});
	tip.marginWithoutRearDrop = tipNoDrop.margin;
	tip.marginGain = Math.round((tip.margin - tipNoDrop.margin) * 1e3) / 1e3;
	const racking = rackingCheck({
		hasBackPanel: spec.backPanel,
		hasBraces: spec.kind === "table"
	});
	const fastenerLines = [];
	if (joinery.fastener) {
		const joints = spec.kind === "table" ? [{
			label: "apron-to-leg joints",
			lineLength: 90,
			count: 8
		}, {
			label: "top-to-apron joints",
			lineLength: spec.widthMm,
			count: 2
		}] : [{
			label: "shelf-to-side joints",
			lineLength: spec.depthMm,
			count: spec.shelves * 2
		}, {
			label: "plinth-to-side joints",
			lineLength: spec.plinthHeightMm,
			count: spec.plinth ? 2 : 0
		}];
		for (const j of joints) {
			if (!j.count) continue;
			const per = fastenerCountFor(j.lineLength, joinery);
			if (per) fastenerLines.push({
				label: j.label,
				per,
				count: per * j.count
			});
		}
	}
	const bandingMm = spec.kind === "table" ? 2 * (spec.widthMm + spec.depthMm) : spec.heightMm * 2 + span * spec.shelves + (spec.plinth ? span * 2 : 0);
	const flags = buildFlags({
		spec,
		material,
		check,
		tip,
		racking,
		nest: carcassNest,
		joinery
	});
	return {
		spec,
		material: {
			id: material.id,
			label: material.label,
			E: material.E,
			densityKgM3: material.density,
			grainSensitive: material.grainSensitive,
			verified: material.verified
		},
		joinery,
		spanMm: span,
		clearBayMm: spec.bayClearMm,
		parts: parts.map((p) => ({
			...p,
			massKg: round2(boardMassKg(resolveMaterial(p.material || spec.material), p.thicknessMm, p.widthMm, p.lengthMm) * p.qty)
		})),
		nesting: {
			carcass: {
				...carcassNest,
				sheet
			},
			back: {
				...backNest,
				sheet
			},
			sheetCount: carcassNest.sheetCount + backNest.sheetCount,
			carcassSheetCount: carcassNest.sheetCount,
			backSheetCount: backNest.sheetCount
		},
		checks: {
			shelfDeflection: check,
			shelfSelfMassKg: round2(shelfSelfMassKg),
			shelfSelfMassPerMmKg: shelfSelfPerMm,
			tipOver: tip,
			racking
		},
		remedy,
		fasteners: fastenerLines,
		edgeBandingMm: Math.round(bandingMm),
		totalMassKg: round2(carcassMassKg),
		flags
	};
}
function buildFlags({ spec, material, check, tip, racking, nest, joinery }) {
	const flags = [];
	if (!material.verified) flags.push({
		level: "verify",
		code: "unverified-material-data",
		message: `Elastic modulus for ${material.label} is a typical published value, not a supplier datasheet. Confirm E before trusting the deflection margin.`
	});
	if (!check.pass) flags.push({
		level: "fail",
		code: "shelf-sag",
		message: `A ${spec.widthMm} mm wide unit gives a ${Math.round(spec.widthMm - 2 * spec.thicknessMm)} mm span. At ${spec.thicknessMm} mm ${material.label} with ${spec.loadPerShelfKg} kg load, long-term sag is ${check.longTermMm} mm against a ${check.limitMm} mm limit (${Math.round(check.utilisation * 100)}% of allowance).`
	});
	if (tip.anchoredRequired && !spec.anchored && spec.kind !== "table") flags.push({
		level: "fail",
		code: "tip-over",
		message: `Unanchored tip-over margin is only ${tip.margin} (needs ≥ 1.0). This unit must be fixed to the wall.`
	});
	if (!racking.pass) flags.push({
		level: "fail",
		code: "racking",
		message: racking.action ?? "racking check failed"
	});
	if (joinery.substituted) flags.push({
		level: "warn",
		code: "joinery-substituted",
		message: joinery.selectedBecause
	});
	if (nest.overallUtilisation < .5 && nest.sheetCount > 1) flags.push({
		level: "warn",
		code: "low-sheet-yield",
		message: `Only ${Math.round(nest.overallUtilisation * 100)}% of the purchased sheets ends up as parts.`
	});
	if (nest.unplaced.length) flags.push({
		level: "fail",
		code: "unplaceable-part",
		message: `${nest.unplaced.length} part(s) do not fit on a sheet.`
	});
	return flags;
}
var PRICE_BOOK = {
	asOf: "2026-09-28",
	defaultCurrency: "USD",
	items: {
		"sheet-18mm-birch-plywood-2440x1220": {
			label: "18 mm full-birch plywood sheet, 2440 × 1220 mm (E0)",
			unit: "sheet",
			price: 15.5,
			currency: "USD",
			basis: "bulk-moq",
			moq: 400,
			supplier: "Shanghai Techlon Co., Ltd. (Foresmate)",
			listing: "Made-in-China.com",
			url: "https://foresmate.en.made-in-china.com/",
			note: "Tier price for 400–999 sheets. A single-sheet retail price was not sourced."
		},
		"sheet-25mm-birch-plywood-2440x1220": {
			label: "25 mm birch plywood sheet, 2440 × 1220 mm",
			unit: "sheet",
			price: null,
			currency: "USD",
			basis: "not-sourced",
			moq: null,
			note: "25 mm full-birch plywood was not sourced at a verifiable price."
		},
		"sheet-6mm-back-panel": {
			label: "6 mm back-panel sheet (plywood or hardboard)",
			unit: "sheet",
			price: null,
			currency: "USD",
			basis: "not-sourced",
			moq: null,
			note: "Not sourced."
		},
		"pocket-screws-32mm-500ct": {
			label: "Pocket-hole screws 1-1/4\" coarse washer-head, 500 count",
			unit: "pack of 500",
			price: 27.14,
			currency: "USD",
			basis: "retail",
			moq: 1,
			supplier: "Kreg",
			listing: "Amazon.com",
			url: "https://www.amazon.com/SML-C125-500-4-Inch-Coarse-Washer-Head-500-Pack/dp/B0002QZ4XK"
		},
		"pocket-hole-jig-kit": {
			label: "Pocket-hole jig kit, 3/8\" (Kreg)",
			unit: "kit",
			price: 24.98,
			currency: "USD",
			basis: "retail",
			moq: 1,
			supplier: "Kreg"
		},
		"wall-anchor-kit-4pack": {
			label: "Anti-tip / furniture-to-wall anchor kit (4 anchors)",
			unit: "pack",
			price: 65,
			currency: "AUD",
			basis: "retail",
			moq: 1,
			supplier: "Bladopia via Desertcart AU",
			note: "Priced in AUD. In a USD total this line is reported separately, not converted."
		},
		"dowel-pins-44mm-250ct": {
			label: "Fluted wooden dowel pins, pack of 250",
			unit: "pack of 250",
			price: 9.54,
			currency: "USD",
			basis: "retail",
			moq: 1
		},
		"confirmat-screws-7x50": {
			label: "Confirmat furniture screws 7 × 50 mm",
			unit: "piece",
			price: null,
			currency: "USD",
			basis: "not-sourced",
			moq: null,
			note: "No listing with a verifiable price was found."
		},
		"sheet-18mm-plywood-au-local": {
			label: "18 mm plywood sheet, 2400 × 1200 mm (locally supplied, cabinet grade)",
			unit: "sheet",
			price: 135,
			currency: "AUD",
			basis: "retail-classifieds",
			moq: 1,
			supplier: "Gold Coast region seller (classifieds)",
			listing: "Gumtree QLD",
			url: "https://www.gumtree.com.au/s-home-garden/gold-coast/plywood+sheets/k0c18397l3006035",
			note: "Classifieds figure, not a trade quote. The bureau's own quote must replace this line."
		},
		"sheet-6mm-plywood-au-local": {
			label: "6 mm plywood sheet (back panel, local AU supply)",
			unit: "sheet",
			price: null,
			currency: "AUD",
			basis: "not-sourced",
			moq: null,
			note: "No 6 mm plywood price was found for the Gold Coast region."
		},
		"cut-to-size-cnc-service": {
			label: "CNC / laser cut-to-size bureau",
			unit: "job",
			price: null,
			currency: null,
			basis: "quote-based",
			moq: 1,
			note: "Quote-based by nature. The engine produces the DXF; it does not invent a cut-service price."
		}
	}
};
var REGIONS = {
	"cn-bulk": {
		id: "cn-bulk",
		label: "China bulk supply",
		supplyMode: "supply-chain",
		currency: "USD",
		sheetMm: {
			lengthMm: 2440,
			widthMm: 1220
		},
		carcassSheetPriceKey: "sheet-18mm-birch-plywood-2440x1220",
		backPanelPriceKey: "sheet-6mm-back-panel",
		gstRate: 0,
		freightModelled: false,
		cutServiceIncluded: false,
		note: "Container-tier pricing. Freight, customs and duty are not modelled. MOQ is ~400 sheets."
	},
	"au-qld-local": {
		id: "au-qld-local",
		label: "Gold Coast QLD, local fabrication",
		supplyMode: "local-fabrication",
		currency: "AUD",
		sheetMm: {
			lengthMm: 2400,
			widthMm: 1200
		},
		carcassSheetPriceKey: "sheet-18mm-plywood-au-local",
		backPanelPriceKey: "sheet-6mm-plywood-au-local",
		gstRate: .1,
		freightModelled: false,
		cutServiceIncluded: false,
		note: "Local bureau holds stock — no MOQ, no freight leg. The 18 mm sheet price is a classifieds figure and is the weakest number in the chain."
	}
};
function resolveRegion(id) {
	if (!id) return null;
	if (typeof id === "object") return id;
	return REGIONS[id] ?? null;
}
function regionSheet(region) {
	if (!region?.sheetMm) return null;
	return {
		lengthMm: region.sheetMm.lengthMm,
		widthMm: region.sheetMm.widthMm
	};
}
function costBuild(cutList, options = {}) {
	const book = PRICE_BOOK;
	const region = resolveRegion(options.region ?? null);
	const currency = options.currency || region?.currency || book.defaultCurrency;
	const lines = [];
	const unpriced = [];
	const otherCurrency = [];
	const add = (key, qty, role, extra = {}) => {
		const item = book.items[key];
		if (!item) {
			unpriced.push({
				key,
				qty,
				role,
				label: key,
				reason: "not present in price book"
			});
			return;
		}
		if (item.price == null) {
			unpriced.push({
				key,
				qty,
				role,
				label: item.label,
				reason: item.note || "not sourced",
				url: item.url ?? void 0
			});
			return;
		}
		const line = {
			key,
			label: item.label,
			qty,
			unit: item.unit,
			unitPrice: item.price,
			currency: item.currency ?? currency,
			lineTotal: round2(item.price * qty),
			basis: item.basis,
			moq: item.moq ?? null,
			supplier: item.supplier,
			listing: item.listing,
			url: item.url,
			asOf: book.asOf,
			basisMismatch: item.basis === "bulk-moq" && (item.moq ?? 1) > qty,
			role,
			...extra
		};
		if (item.currency && item.currency !== currency) otherCurrency.push(line);
		else lines.push(line);
	};
	const t = cutList.spec.thicknessMm;
	const carcassKey = region?.carcassSheetPriceKey || `sheet-${t}mm-birch-plywood-2440x1220`;
	if (/18mm/.test(carcassKey) && t !== 18) unpriced.push({
		key: carcassKey,
		qty: cutList.nesting.carcassSheetCount,
		role: "material",
		label: `${t} mm ${cutList.material.label} sheet`,
		reason: `Price book only has a sourced figure for 18 mm. ${t} mm is unpriced — a made-up number would propagate into every design that follows.`
	});
	else if (book.items[carcassKey]) add(carcassKey, cutList.nesting.carcassSheetCount, "material");
	else unpriced.push({
		key: carcassKey,
		qty: cutList.nesting.carcassSheetCount,
		role: "material",
		label: `${t} mm ${cutList.material.label} sheet`,
		reason: region ? `no sourced price for region "${region.id}" at this thickness` : "no sourced price for this thickness — only 18 mm was priced"
	});
	if (cutList.nesting.backSheetCount) add(region?.backPanelPriceKey || "sheet-6mm-back-panel", cutList.nesting.backSheetCount, "material");
	const j = cutList.joinery;
	if (j.id === "pocket-screw") {
		const totalScrews = cutList.fasteners.reduce((s, f) => s + f.count, 0);
		add("pocket-screws-32mm-500ct", Math.max(1, Math.ceil(totalScrews / 500)), "consumable", { note: `prorated from a 500-count pack for ${totalScrews} screws` });
	} else if (j.id === "confirmat") add("confirmat-screws-7x50", cutList.fasteners.reduce((s, f) => s + f.count, 0), "consumable");
	else if (j.id === "dowel") {
		const totalDowels = cutList.fasteners.reduce((s, f) => s + f.count, 0);
		add("dowel-pins-44mm-250ct", Math.max(1, Math.ceil(totalDowels / 250)), "consumable");
	}
	if (cutList.checks.tipOver.anchoredRequired) add("wall-anchor-kit-4pack", 1, "safety");
	const tools = [];
	if (j.id === "pocket-screw") {
		const kit = book.items["pocket-hole-jig-kit"];
		if (kit && kit.price != null) tools.push({
			key: "pocket-hole-jig-kit",
			label: kit.label,
			qty: 1,
			unit: kit.unit,
			unitPrice: kit.price,
			currency: kit.currency ?? currency,
			lineTotal: kit.price,
			basis: kit.basis,
			moq: kit.moq,
			asOf: book.asOf,
			basisMismatch: false,
			role: "tool",
			note: "one-off tool purchase; reusable across builds"
		});
	}
	let tax = null;
	if (region?.gstRate) {
		const subtotal = round2(lines.reduce((s, l) => s + l.lineTotal, 0));
		tax = {
			label: `GST ${(region.gstRate * 100).toFixed(0)}%`,
			rate: region.gstRate,
			amount: round2(subtotal * region.gstRate)
		};
	}
	const total = round2(lines.reduce((s, l) => s + l.lineTotal, 0) + (tax?.amount ?? 0));
	const toolTotal = round2(tools.reduce((s, l) => s + l.lineTotal, 0));
	const mismatched = lines.filter((l) => l.basisMismatch);
	return {
		asOf: book.asOf,
		currency,
		region: region ? {
			id: region.id,
			label: region.label,
			supplyMode: region.supplyMode,
			sheetMm: region.sheetMm,
			freightModelled: region.freightModelled,
			cutServiceIncluded: region.cutServiceIncluded
		} : null,
		lines,
		tools,
		total,
		tax,
		toolTotal,
		otherCurrency,
		unpriced,
		confidence: {
			pricedLines: lines.length,
			unpricedLines: unpriced.length,
			anyBulkTierPriced: mismatched.length > 0,
			note: unpriced.length || mismatched.length ? "This is a partial cost. See unpriced lines and bulk-tier mismatches — nothing here is estimated." : "All lines priced from verified listings."
		}
	};
}
function buildAssemblySequence(cutList) {
	const { spec, joinery, material, checks } = cutList;
	const mat = resolveMaterial(material.id);
	const steps = [];
	let n = 0;
	const step = (title, detail, reason, tools = []) => steps.push({
		step: ++n,
		title,
		detail,
		reason,
		tools
	});
	step("Verify the material and the sag margin before cutting", `Measure the actual sheet: nominal ${spec.thicknessMm} mm commonly runs thinner. Re-run the deflection figure with measured thickness.${checks.shelfDeflection.pass ? "" : " This design already fails the sag check — resolve that before cutting timber."}`, "Sheet goods are undersize more often than not, and every downstream dimension depends on the real thickness.", ["calipers or vernier", "pencil"]);
	const tip = checks.tipOver;
	if (tip && tip.rearDropMm > 0 && spec.kind !== "table") step("Relieve the rear bottom edge to set the backward lean", `Shorten the rear support by ${tip.rearDropMm} mm on each side panel. At ${spec.depthMm} mm depth that leans the unit back ${tip.tiltDeg}° and moves the centre of mass ${tip.comShiftMm} mm toward the wall.`, `Tip-over margin goes from ${tip.marginWithoutRearDrop} to ${tip.margin} (still below 1, so the wall fixing is mandatory). The lean also makes books rest against the wall instead of tipping forward.`, ["plane or saw", "spirit level"]);
	step("Break down the sheet into parts", `Cut ${cutList.nesting.carcassSheetCount} sheet(s) of ${spec.thicknessMm} mm ${mat.label}. Use the nested layout — do not re-nest by eye. Keep each part labelled on the back face.`, "The nesting already accounts for grain direction; re-cutting by eye is how grain direction gets flipped.", [
		"circular saw or table saw",
		"straight edge",
		"clamps",
		"safety glasses",
		"hearing protection"
	]);
	if (spec.backPanel) step("Cut the back panel", `Cut the ${spec.backThicknessMm} mm back panel to ${spec.heightMm} × ${spec.widthMm} mm. Square it to the carcass.`, "The back panel is the anti-racking member, so it has to actually fit the assembled carcass.", ["saw", "square"]);
	step("Label and orient every part", spec.kind === "table" ? `Grain on the top runs along the ${spec.widthMm} mm length. Legs: grain vertical.` : `Mark which face is "out" on the two side panels and keep the grain running vertically. Shelves: grain along the ${cutList.spanMm} mm span.`, "Plywood grain is directional. Flipping a part after drilling puts the pocket holes on the visible face.", ["pencil", "masking tape"]);
	if (joinery.id === "pocket-screw") step("Drill pocket holes", `Set the jig for ${spec.thicknessMm} mm stock. Interior horizontals get pocket holes on the underside, two per end, at least ${joinery.edgeDistanceMm} mm from the end.`, "Pocket screws are drilled before assembly; you cannot drill a closed box.", joinery.tooling ?? []);
	else if (joinery.id === "dado") step("Cut the dados", `Route or saw ${spec.thicknessMm} mm wide grooves in both side panels at each shelf position. Depth: one third of the panel width (${Math.round(spec.depthMm / 3)} mm). Test on an offcut first.`, "A dado must match the actual panel thickness, which is why it is cut after measuring the sheet.", joinery.tooling ?? []);
	else if (joinery.id === "confirmat") step("Drill confirmat pilot holes", "5 mm pilot through the side panel, 7 mm clearance in the mating part, with a shallow countersink. Pilot depth 42 mm for a 50 mm screw.", "Confirmat screws need the stepped pilot or they crush the board face.", joinery.tooling ?? []);
	else if (joinery.id === "cam") step("Bore cam housings and dowel holes", "Bore 15 mm cam housings in the side panels and matching 8 mm dowel holes in the shelf ends, using one reference edge for every part.", "Knock-down hardware only lines up if every part is bored off the same reference.", joinery.tooling ?? []);
	if (spec.kind === "table") step("Assemble the apron frame, then the top", "Join the four aprons to the four legs, check diagonals within 1 mm, then screw the top from below through the aprons so no fastener shows on the working face.", "A racked frame cannot be pulled square by the top — the top holds it square.", [
		"clamps",
		"tape measure",
		"driver"
	]);
	else step("Assemble the carcass flat, then square it", `Join one side, all ${spec.shelves} horizontals and the second side. Measure both diagonals of the assembled box: they must match within 1 mm before you tighten anything.`, "A racked carcass cannot be corrected by the back panel — the back holds it square, it does not pull it square.", [
		"clamps",
		"tape measure or diagonal gauge",
		"driver"
	]);
	if (spec.backPanel) step("Fix the back panel", "Glue and pin the back panel to the rear edges of the carcass. Pins every 150 mm. Check the diagonals again after fixing.", "The back panel turns four hinges into a shear diaphragm; this is the single step that makes the box rigid.", [
		"panel pins or staples",
		"hammer or stapler",
		"glue"
	]);
	if (spec.plinth) step(`Fit the ${spec.plinthHeightMm} mm plinth`, "Fit the front rail flush with the bottom shelf front edge, inset 10 mm from the front face so it reads as a shadow line.", "A recessed plinth hides the floor line and stops the unit rocking on an uneven floor.", ["clamps", "driver"]);
	step("Band the exposed edges", `Iron on edge banding to the front edges: ${cutList.edgeBandingMm} mm of banding in total. Trim flush and ease the corners with 120–180 grit.`, "Bare plywood edges telegraph every void in the core and absorb moisture faster than the face.", [
		"iron",
		"edge trimmer",
		"120–180 grit abrasive block"
	]);
	step("Finish", `Sand to 180 grit, then apply ${mat.id === "mdf" ? "a sealing primer before any water-based finish (MDF edges drink it)" : "a hard-wax oil or water-based lacquer"}. Leave to cure fully before loading.`, "Finishing is the last step because sanding dust ruins a finish and a finish ruins a glue-up.", [
		"sander",
		"tack cloth",
		"brush"
	]);
	if (spec.kind !== "table") step("Anchor to the wall", checks.tipOver.anchoredRequired || spec.anchored ? `Fix the unit to the wall structure. Margin without anchoring is ${checks.tipOver.margin}, which is below 1.0. Find studs or use rated hollow-wall anchors, and anchor at the top rail.` : "Anchoring is optional by calculation for this geometry, but recommended in any room a child uses.", "Tip-over is the leading furniture injury mechanism; the calculation decides whether it is mandatory, not whether it is wise.", [
		"stud finder",
		"drill",
		"wall anchor kit"
	]);
	step("Load test and sign off", `Load ${spec.kind === "table" ? "the top" : "each shelf"} with ${spec.loadPerShelfKg} kg evenly distributed and measure the centre deflection after 24 hours. Predicted long-term deflection is ${checks.shelfDeflection.longTermMm} mm against a ${checks.shelfDeflection.limitMm} mm limit.`, "Measuring closes the loop between the model and the real board, which is the only way the model gets more accurate over time.", [
		"tape measure",
		"straight edge",
		"weight reference"
	]);
	return {
		steps,
		stepCount: steps.length
	};
}
var BANDS = {
	green: {
		min: 80,
		colour: "#5eead4",
		label: "buildable as drawn"
	},
	amber: {
		min: 60,
		colour: "#e8b86d",
		label: "buildable with mitigations"
	},
	red: {
		min: 0,
		colour: "#e07a73",
		label: "do not build as drawn"
	}
};
var WEIGHTS = {
	physics: .3,
	safety: .25,
	manufacturability: .15,
	cost: .15,
	complexity: .1,
	energy: .05
};
function bandOf(score) {
	if (score >= BANDS.green.min) return "green";
	if (score >= BANDS.amber.min) return "amber";
	return "red";
}
function scoreFormStage({ spec }) {
	const issues = [];
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
		dimensions: {
			physics: null,
			safety: null,
			manufacturability: null,
			cost: null,
			complexity: null,
			energy: null
		},
		issues,
		mitigations: [],
		status: score >= 80 ? "PASS" : score >= 60 ? "REVIEW" : "FAIL",
		caveat: "Structural and cost dimensions are not yet computed; this score only reflects proportions and fit."
	};
}
function scoreReality({ spec, cutList, cost }) {
	const dimensions = {};
	const issues = [];
	const mitigations = [];
	const def = cutList.checks.shelfDeflection;
	let sagScore;
	if (def.pass) sagScore = clamp(100 - 25 * def.utilisation);
	else {
		sagScore = clamp(60 - 60 * (def.utilisation - 1));
		issues.push(`Shelf sag: ${def.longTermMm} mm predicted long-term against a ${def.limitMm} mm allowance (${Math.round(def.utilisation * 100)}%).`);
		if (cutList.remedy) {
			if (cutList.remedy.thickerPasses) mitigations.push(`Use ${cutList.remedy.thickerSheetMm} mm stock — predicted sag drops to ${cutList.remedy.thickerDeflectionMm} mm.`);
			if (cutList.remedy.midRailAtHalfSpanPasses) mitigations.push(`Add a mid-rail or centre divider: halving the span drops predicted sag to ${cutList.remedy.midRailDeflectionMm} mm without changing material.`);
			if (cutList.remedy.deeperShelfPasses) mitigations.push(`Increase shelf depth to ${cutList.remedy.deeperShelfMm} mm — sag ${cutList.remedy.deeperShelfDeflectionMm} mm.`);
		}
	}
	const tip = cutList.checks.tipOver;
	const tipScore = tip.pass ? clamp(70 + 30 * Math.min(1, tip.margin - 1)) : clamp(tip.margin * 100);
	const rack = cutList.checks.racking;
	const rackScore = rack.pass ? 100 : 40;
	if (!rack.pass) issues.push(`Racking: ${rack.action}`);
	dimensions.physics = Math.round(.5 * sagScore + .3 * tipScore + .2 * rackScore);
	let safety = 100;
	if (spec.kind !== "table" && tip.anchoredRequired && !spec.anchored) {
		safety -= 35;
		issues.push(`Tip-over margin ${tip.margin} with no wall fixing. This is the leading furniture injury mechanism in homes with children.`);
		mitigations.push("Fix the unit to the wall (studs, or rated hollow-wall anchors).");
	}
	if (spec.widthMm >= 600 && spec.heightMm >= 1200 && !spec.anchored && spec.kind !== "table") safety -= 10;
	if (spec.loadPerShelfKg > 40) {
		safety -= 10;
		issues.push(`${spec.loadPerShelfKg} kg per shelf is above a normal domestic book load (25 kg).`);
	}
	dimensions.safety = clamp(safety);
	const yieldPct = cutList.nesting.carcass.overallUtilisation;
	let mfg = yieldPct >= .65 ? 100 : yieldPct >= .5 ? 88 : yieldPct >= .4 ? 72 : 55;
	if (cutList.nesting.carcass.unplaced.length) {
		mfg = 0;
		issues.push("At least one part does not fit on a standard sheet at any rotation.");
	}
	if (cutList.nesting.carcassSheetCount > 1) {
		mfg -= 5;
		mitigations.push(`Two sheets are required at ${Math.round(yieldPct * 100)}% yield — the grain constraint forces the orientation.`);
	}
	dimensions.manufacturability = clamp(mfg);
	if (spec.budget) {
		const ratio = cost.total / spec.budget;
		dimensions.cost = clamp(ratio <= .8 ? 100 : ratio <= 1 ? 90 - (ratio - .8) * 100 : 82 - (ratio - 1) * 200);
		if (ratio > 1) {
			issues.push(`Priced subtotal ${cost.total} ${cost.currency} is over the ${spec.budget} ${cost.currency} budget.`);
			mitigations.push("Switch the joinery to dowels, drop the back panel to 3 mm, or reduce shelf count.");
		}
	} else {
		const unpricedPenalty = cost.unpriced.length * 8;
		const mismatchPenalty = cost.lines.filter((l) => l.basisMismatch).length * 12;
		dimensions.cost = clamp(100 - unpricedPenalty - mismatchPenalty, 40, 100);
		if (cost.unpriced.length) issues.push(`${cost.unpriced.length} line(s) in the bill of materials have no verified price.`);
		const mismatched = cost.lines.filter((l) => l.basisMismatch);
		if (mismatched.length) issues.push(`${mismatched.length} line(s) are priced at a bulk MOQ tier you cannot buy at for one build.`);
	}
	const partCount = cutList.parts.reduce((s, p) => s + p.qty, 0);
	let complexity = clamp(100 - Math.max(0, partCount - 8) * 3);
	if (cutList.fasteners.reduce((s, f) => s + f.count, 0) > 60) complexity -= 10;
	if (cutList.joinery.substituted) complexity -= 5;
	dimensions.complexity = clamp(complexity);
	const pathMm = cutList.nesting.carcass.sheets.reduce((s, sheet) => s + sheet.parts.reduce((a, p) => a + 2 * (p.lengthMm + p.widthMm), 0), 0);
	const cncMinutes = Math.round(pathMm / 3e3 * 10) / 10;
	dimensions.energy = clamp(100 - Math.max(0, cncMinutes - 20) * .5);
	const score = clamp(Math.round(Object.entries(WEIGHTS).reduce((sum, [k, w]) => sum + (dimensions[k] ?? 0) * w, 0)));
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
		cnc: {
			pathLengthMm: Math.round(pathMm),
			estimatedMinutes: cncMinutes,
			feedRateMmPerMin: 3e3
		},
		status: score >= 80 ? "PASS" : score >= 60 ? "REVIEW" : "FAIL"
	};
}
function exploreVariants(spec, options = {}) {
	const region = resolveRegion(options.region ?? null);
	const sheet = region ? regionSheet(region) ?? void 0 : void 0;
	const maxVariants = options.maxVariants ?? 12;
	const dimensions = [
		{
			key: "thicknessMm",
			values: [
				15,
				18,
				21,
				25
			]
		},
		{
			key: "shelves",
			values: [
				spec.shelves - 1,
				spec.shelves,
				spec.shelves + 1
			]
		},
		{
			key: "depthMm",
			values: [
				250,
				300,
				350
			]
		},
		{
			key: "joinery",
			values: [
				"pocket-screw",
				"dado",
				"dowel"
			]
		},
		{
			key: "backPanel",
			values: [true, false]
		},
		{
			key: "anchored",
			values: [true]
		}
	];
	const results = [];
	for (const d of dimensions) {
		for (const value of d.values) {
			if (value === spec[d.key]) continue;
			if (d.key === "shelves" && typeof value === "number" && value < 2 && spec.kind !== "table") continue;
			const variantSpec = {
				...spec,
				[d.key]: value
			};
			try {
				const cutList = buildCutList(variantSpec, { sheet });
				const cost = costBuild(cutList, { region: options.region });
				const scored = scoreReality({
					spec: cutList.spec,
					cutList,
					cost
				});
				results.push({
					change: { [d.key]: value },
					score: scored.score,
					band: scored.band,
					total: cost.total,
					currency: cost.currency
				});
			} catch {}
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
		note: "Each variant is a full recomputation of geometry, load check and cost. Nothing is proposed without being checked."
	};
}
function specFromIntent(intent, overrides = {}) {
	const s = intent.slots;
	let spec = {
		...DEFAULT_SPEC,
		kind: intent.kind === "unknown" || intent.kind === "ui" || intent.kind === "concept" || intent.kind === "frame" ? "bookshelf" : intent.kind,
		widthMm: s.widthMm.value,
		heightMm: s.heightMm.value,
		depthMm: s.depthMm.value,
		shelves: s.shelves.value,
		material: s.material.value,
		thicknessMm: s.thicknessMm.value,
		anchored: s.anchored.value,
		knockdown: s.knockdown.value,
		loadPerShelfKg: s.loadPerShelfKg.value,
		budget: s.budget.value ?? null,
		...overrides
	};
	if (intent.modifications?.length) {
		const { spec: modified, applied } = applyModifications(spec, intent.modifications);
		spec = modified;
		spec.appliedModifications = applied;
	}
	return normaliseSpec(spec);
}
function runPipeline(utterance, options = {}) {
	const region = resolveRegion(options.region ?? "au-qld-local");
	const sheet = region ? regionSheet(region) ?? void 0 : void 0;
	const intent = options.existingIntent ?? parseIntent(utterance);
	const stages = [];
	const stage = (name, score, colour, note, extra = {}) => stages.push({
		stage: name,
		score,
		band: score >= 80 ? "green" : score >= 60 ? "amber" : "red",
		colour,
		note,
		...extra
	});
	stage("intent", Math.round(intent.confidence * 100), intent.confidence >= .6 ? BANDS.green.colour : intent.confidence >= .35 ? BANDS.amber.colour : BANDS.red.colour, `Parsed “${intent.kind}”. ${Math.round(intent.confidence * 100)}% of slots came from you; the rest are defaults listed as open questions.`, { openQuestions: intent.openQuestions.length });
	const spec = specFromIntent(intent, options.specOverrides || {});
	const form = scoreFormStage({ spec });
	stage("form", form.score, form.colour, form.issues.length ? form.issues.join(" ") : "Proportions and fit are plausible.", { issues: form.issues });
	const cutList = buildCutList(spec, { sheet });
	const def = cutList.checks.shelfDeflection;
	stage("geometry", def.pass ? Math.round(100 - 25 * def.utilisation) : Math.max(0, Math.round(60 - 60 * (def.utilisation - 1))), def.pass ? BANDS.green.colour : BANDS.red.colour, `Span ${cutList.spanMm} mm. Predicted long-term sag ${def.longTermMm} mm against a ${def.limitMm} mm allowance.`, {
		spanMm: cutList.spanMm,
		longTermMm: def.longTermMm,
		limitMm: def.limitMm
	});
	const alternatives = alternativesFor(cutList.spec.material);
	stage("material", def.pass ? 90 : 70, def.pass ? BANDS.green.colour : BANDS.amber.colour, `${cutList.material.label}. ${cutList.material.verified ? "Stiffness data verified." : "Handbook modulus — not a supplier datasheet."}`);
	const cost = costBuild(cutList, { region: region?.id });
	stage("economics", cost.unpriced.length === 0 && !cost.confidence.anyBulkTierPriced ? 95 : cost.unpriced.length <= 1 ? 72 : 60, cost.unpriced.length === 0 ? BANDS.green.colour : BANDS.amber.colour, `Priced subtotal ${cost.total} ${cost.currency}${cost.unpriced.length ? `, ${cost.unpriced.length} line(s) unpriced` : ""}. Price book as of ${cost.asOf}.`);
	const reality = scoreReality({
		spec: cutList.spec,
		cutList,
		cost
	});
	const assembly = buildAssemblySequence(cutList);
	const plan = rectilinearPlan(cutList);
	cutList.plan = plan;
	stage("output", reality.score, reality.colour, reality.issues.length ? reality.issues.join(" ") : "No blocking issues. Package is buildable as drawn.", { status: reality.status });
	return {
		utterance,
		intent,
		spec: cutList.spec,
		stages,
		cutList,
		cost,
		assembly,
		reality,
		materialDecision: {
			selected: cutList.material,
			why: cutList.material.verified ? "Selected material matches the request and its stiffness data is verified." : "Default sheet material for furniture-grade case goods: stiff for its mass, takes fasteners well, widely available in 18 mm.",
			alternatives: alternatives.slice(0, 3),
			note: "Alternatives are ranked by stiffness-to-mass using typical published moduli; cost comes from the vendor price book."
		},
		plan,
		elevations: elevations(cutList),
		blob: {
			colour: reality.colour,
			band: reality.band
		},
		alternatives,
		openQuestions: intent.openQuestions
	};
}
function rerunWithSpec(base, specOverrides, region = "au-qld-local") {
	return runPipeline(base.utterance, {
		region,
		specOverrides,
		existingIntent: base.intent
	});
}
function dreamState(utterance, options = {}) {
	const base = runPipeline(utterance, options);
	return {
		base,
		dream: exploreVariants(base.cutList.spec, { region: options.region ?? "au-qld-local" })
	};
}
function hashString(str) {
	let h = 2166136261;
	for (let i = 0; i < String(str).length; i++) {
		h ^= String(str).charCodeAt(i);
		h = Math.imul(h, 16777619);
	}
	return h >>> 0;
}
var SNAP_KEY = "sovereign-blob-v1";
function loadPersisted() {
	if (typeof window === "undefined") return {
		snapshots: [],
		region: "au-qld-local",
		utterance: ""
	};
	try {
		const raw = window.localStorage.getItem(SNAP_KEY);
		if (!raw) return {
			snapshots: [],
			region: "au-qld-local",
			utterance: ""
		};
		const p = JSON.parse(raw);
		return {
			snapshots: p.snapshots ?? [],
			region: p.region ?? "au-qld-local",
			utterance: p.utterance ?? ""
		};
	} catch {
		return {
			snapshots: [],
			region: "au-qld-local",
			utterance: ""
		};
	}
}
function savePersisted(s) {
	if (typeof window === "undefined") return;
	window.localStorage.setItem(SNAP_KEY, JSON.stringify(s));
}
var idleStart = amorphous(1);
var useBlobStore = create((set, get) => ({
	utterance: "",
	region: "au-qld-local",
	phase: "idle",
	morph: 0,
	result: null,
	dream: null,
	dreaming: false,
	snapshots: [],
	ageYears: 0,
	inspectorOpen: false,
	tab: "reality",
	seed: 1,
	startShape: idleStart,
	targetShape: idleStart,
	lastError: null,
	hydrated: false,
	hydrate: () => {
		if (get().hydrated) return;
		set({
			...loadPersisted(),
			hydrated: true
		});
	},
	setUtterance: (v) => {
		set({ utterance: v });
		const { snapshots, region } = get();
		savePersisted({
			snapshots,
			region,
			utterance: v
		});
	},
	setRegion: (r) => {
		const { result, utterance, snapshots } = get();
		set({ region: r });
		savePersisted({
			snapshots,
			region: r,
			utterance
		});
		if (result) {
			const next = runPipeline(utterance || result.utterance, {
				region: r,
				specOverrides: result.spec,
				existingIntent: result.intent
			});
			set({
				result: next,
				targetShape: shapeForTemplate(next.intent.template, next.spec)
			});
		}
	},
	setPhase: (p) => set({ phase: p }),
	setMorph: (n) => set({ morph: n }),
	setAgeYears: (n) => set({ ageYears: n }),
	setTab: (t) => set({ tab: t }),
	setInspectorOpen: (v) => set({ inspectorOpen: v }),
	form: (text) => {
		const utterance = (text ?? get().utterance).trim();
		if (!utterance) {
			set({ lastError: "Say or type what you want to make." });
			return null;
		}
		try {
			const result = runPipeline(utterance, { region: get().region });
			const seed = hashString(utterance) || 1;
			set({
				utterance,
				result,
				dream: null,
				lastError: null,
				phase: "forming",
				morph: 0,
				seed,
				startShape: amorphous(seed),
				targetShape: shapeForTemplate(result.intent.template, result.spec),
				inspectorOpen: true,
				ageYears: 0
			});
			savePersisted({
				snapshots: get().snapshots,
				region: get().region,
				utterance
			});
			return result;
		} catch (err) {
			set({ lastError: err instanceof Error ? err.message : "The pipeline failed." });
			return null;
		}
	},
	applySpec: (overrides) => {
		const { result, region } = get();
		if (!result) return;
		const next = rerunWithSpec(result, {
			...result.spec,
			...overrides
		}, region);
		set({
			result: next,
			targetShape: shapeForTemplate(next.intent.template, next.spec),
			morph: 1,
			phase: "settled"
		});
	},
	runDream: () => {
		const { utterance, result, region } = get();
		const text = utterance || result?.utterance;
		if (!text) return;
		set({ dreaming: true });
		const { dream } = dreamState(text, {
			region,
			specOverrides: result?.spec
		});
		set({
			dream,
			dreaming: false,
			tab: "dream"
		});
	},
	snapshot: () => {
		const { result, snapshots, region, utterance } = get();
		if (!result) return;
		const next = [{
			id: `snap-${Date.now()}`,
			at: Date.now(),
			label: `${result.spec.kind} ${result.spec.widthMm}×${result.spec.heightMm} · ${result.spec.thicknessMm} mm`,
			utterance: result.utterance,
			spec: result.spec,
			score: result.reality.score,
			band: result.reality.band
		}, ...snapshots].slice(0, 24);
		set({ snapshots: next });
		savePersisted({
			snapshots: next,
			region,
			utterance
		});
	},
	restore: (id) => {
		const snap = get().snapshots.find((s) => s.id === id);
		if (!snap) return;
		const result = runPipeline(snap.utterance, {
			region: get().region,
			specOverrides: snap.spec
		});
		set({
			utterance: snap.utterance,
			result,
			phase: "settled",
			morph: 1,
			targetShape: shapeForTemplate(result.intent.template, result.spec),
			inspectorOpen: true
		});
	},
	reset: () => set({
		phase: "idle",
		morph: 0,
		result: null,
		dream: null,
		ageYears: 0,
		inspectorOpen: false,
		startShape: amorphous(1),
		targetShape: amorphous(1)
	})
}));
function hexToRgb(hex) {
	const h = hex.replace("#", "");
	return [
		parseInt(h.slice(0, 2), 16),
		parseInt(h.slice(2, 4), 16),
		parseInt(h.slice(4, 6), 16)
	];
}
function lerp(a, b, t) {
	return a + (b - a) * t;
}
function easeOut(t) {
	return 1 - Math.pow(1 - t, 3);
}
function drawField(ctx, nodes, width, height, colour, alpha) {
	if (alpha <= .01) return;
	const gw = 110;
	const gh = Math.max(64, Math.round(gw * height / width));
	const buf = ctx.createImageData(gw, gh);
	const rgb = hexToRgb(colour);
	const threshold = 1;
	for (let j = 0; j < gh; j++) for (let i = 0; i < gw; i++) {
		const f = fieldAt(nodes, i / 109, j / (gh - 1));
		const d = Math.max(0, Math.min(1, f / (threshold * 2.2)));
		const inside = d > .42;
		const k = (j * gw + i) * 4;
		if (inside) {
			const glow = Math.min(1, d);
			buf.data[k] = Math.round(lerp(8, rgb[0], glow));
			buf.data[k + 1] = Math.round(lerp(10, rgb[1], glow));
			buf.data[k + 2] = Math.round(lerp(14, rgb[2], glow));
			buf.data[k + 3] = Math.round((90 + 150 * glow) * alpha);
		}
	}
	const off = document.createElement("canvas");
	off.width = gw;
	off.height = gh;
	off.getContext("2d").putImageData(buf, 0, 0);
	ctx.imageSmoothingEnabled = true;
	ctx.imageSmoothingQuality = "high";
	ctx.drawImage(off, 0, 0, width, height);
	const lines = contour(nodes, {
		res: 72,
		threshold
	});
	ctx.lineWidth = 1.5;
	ctx.strokeStyle = colour;
	ctx.globalAlpha = .85 * alpha;
	ctx.beginPath();
	for (const line of lines) line.forEach(([x, y], i) => {
		if (i === 0) ctx.moveTo(x * width, y * height);
		else ctx.lineTo(x * width, y * height);
	});
	ctx.stroke();
	ctx.globalAlpha = 1;
}
function drawPlan(ctx, plan, width, height, colour, alpha, sagPx) {
	if (alpha <= .01) return;
	const pad = Math.min(width, height) * .12;
	const scale = Math.min((width - pad * 2) / plan.widthMm, (height - pad * 2) / plan.heightMm);
	const ox = (width - plan.widthMm * scale) / 2;
	const oy = (height - plan.heightMm * scale) / 2;
	const toX = (x) => ox + x * scale;
	const toY = (y) => oy + (plan.heightMm - y) * scale;
	ctx.save();
	ctx.globalAlpha = alpha * .35;
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
		ctx.fillStyle = r.kind === "side" || r.kind === "leg" ? "rgba(94,234,212,0.16)" : r.kind === "plinth" || r.kind === "apron" ? "rgba(232,184,109,0.14)" : "rgba(94,234,212,0.10)";
		ctx.strokeStyle = colour;
		ctx.lineWidth = 1.2;
		if (bow > .4) {
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
function BlobCanvas() {
	const canvasRef = (0, import_react.useRef)(null);
	const phase = useBlobStore((s) => s.phase);
	const startShape = useBlobStore((s) => s.startShape);
	const targetShape = useBlobStore((s) => s.targetShape);
	const result = useBlobStore((s) => s.result);
	const ageYears = useBlobStore((s) => s.ageYears);
	const setMorph = useBlobStore((s) => s.setMorph);
	const setPhase = useBlobStore((s) => s.setPhase);
	(0, import_react.useEffect)(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d", { alpha: true });
		if (!ctx) return;
		let raf = 0;
		let last = performance.now();
		let elapsed = 0;
		const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		let formingT = useBlobStore.getState().morph;
		const loop = (now) => {
			const dt = Math.min(.1, (now - last) / 1e3);
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
			} else if (state.phase === "idle") formingT = 0;
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
			const energy = state.phase === "listening" ? 1.8 : state.phase === "idle" ? 1 : .35;
			const colour = state.result?.reality.colour ?? "#5eead4";
			const eased = easeOut(t);
			let nodes = morph(state.startShape, state.targetShape, eased).nodes;
			if (state.phase !== "settled") nodes = breathe({
				kind: "live",
				nodes
			}, elapsed, energy).nodes;
			const fieldAlpha = 1 - eased * .82;
			drawField(ctx, nodes, w, h, colour, fieldAlpha);
			if (state.result && eased > .2) {
				const sagMm = agedSagMm(state.result.cutList.checks.shelfDeflection.immediateMm, state.ageYears);
				const pad = Math.min(w, h) * .12;
				const scale = Math.min((w - pad * 2) / state.result.plan.widthMm, (h - pad * 2) / state.result.plan.heightMm);
				drawPlan(ctx, state.result.plan, w, h, colour, eased, sagMm * scale);
			}
			raf = requestAnimationFrame(loop);
		};
		raf = requestAnimationFrame(loop);
		return () => cancelAnimationFrame(raf);
	}, [
		phase,
		startShape,
		targetShape,
		result,
		ageYears,
		setMorph,
		setPhase
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
		ref: canvasRef,
		className: "h-full w-full",
		"aria-label": "Living blob field becoming a dimensioned plan"
	});
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-opacity duration-[var(--motion-quick,150ms)] disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-4 [&_svg]:shrink-0", {
	variants: {
		variant: {
			default: "bg-fg text-bg hover:opacity-90",
			ghost: "bg-transparent text-fg border border-border hover:bg-elevated",
			blob: "bg-blob text-bg hover:opacity-90",
			subtle: "bg-elevated text-fg hover:bg-surface"
		},
		size: {
			default: "h-11 rounded-md px-4 text-sm",
			sm: "h-9 rounded-sm px-3 text-sm",
			lg: "h-12 rounded-lg px-5 text-base",
			icon: "size-11 rounded-md"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
function Button({ className, variant, size, asChild = false, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size
		}), className),
		...props
	});
}
function Textarea({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		className: cn("flex min-h-14 w-full rounded-lg border border-border bg-elevated px-3.5 py-3 text-sm text-fg placeholder:text-subtle", "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blob/50", className),
		...props
	});
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var aiStatus = createServerFn({ method: "POST" }).handler(createSsrRpc("a0f232b5ca0187bc9fe40a301ee2940b0a5db3a672463d1e57d3938a935a6d51"));
var explainReality = createServerFn({ method: "POST" }).validator((input) => input).handler(createSsrRpc("ff62f1e9d61a096e7a542c61803445013b6c35fb9070507fc5253b66a9860010"));
var refineUtterance = createServerFn({ method: "POST" }).validator((input) => input).handler(createSsrRpc("17bb5f8e5dce29496e4a11af9bee16910ca15fdaf5ebf0b0acdf2a815b7dc835"));
var EXAMPLES = [
	"build me a bookshelf, 1800 tall and 900 wide, shelves 300 deep",
	"bookshelf 1800 tall 900 wide, 21 mm ply, anchored to the wall",
	"cheap 4-shelf unit for a small apartment, under $80",
	"child-safe bookshelf from reclaimed timber",
	"a workbench 1800 long, 600 deep, 900 high"
];
function Composer({ aiOn }) {
	const utterance = useBlobStore((s) => s.utterance);
	const setUtterance = useBlobStore((s) => s.setUtterance);
	const form = useBlobStore((s) => s.form);
	const setPhase = useBlobStore((s) => s.setPhase);
	const phase = useBlobStore((s) => s.phase);
	const lastError = useBlobStore((s) => s.lastError);
	const [listening, setListening] = (0, import_react.useState)(false);
	const [refining, setRefining] = (0, import_react.useState)(false);
	const recRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
		if (!Ctor) return;
		const rec = new Ctor();
		rec.lang = "en-AU";
		rec.continuous = false;
		rec.interimResults = true;
		rec.onresult = (ev) => {
			const text = ev.results[0]?.[0]?.transcript ?? "";
			if (text) setUtterance(text);
		};
		rec.onend = () => {
			setListening(false);
			const text = useBlobStore.getState().utterance;
			if (text.trim()) form(text);
		};
		rec.onerror = () => setListening(false);
		recRef.current = rec;
	}, [form, setUtterance]);
	const toggleMic = () => {
		if (!recRef.current) return;
		if (listening) {
			recRef.current.stop();
			setListening(false);
			setPhase(useBlobStore.getState().result ? "settled" : "idle");
			return;
		}
		setListening(true);
		setPhase("listening");
		recRef.current.start();
	};
	const onRefine = async () => {
		if (!utterance.trim() || !aiOn) return;
		setRefining(true);
		try {
			const out = await refineUtterance({ data: { utterance } });
			if (out.ok && out.text) {
				setUtterance(out.text.trim());
				form(out.text.trim());
			}
		} finally {
			setRefining(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pointer-events-auto w-full max-w-3xl",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mb-3 flex gap-2 overflow-x-auto pb-1",
			children: EXAMPLES.map((ex) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => {
					setUtterance(ex);
					form(ex);
				},
				className: "shrink-0 rounded-full border border-border bg-surface/80 px-3 py-1.5 text-xs text-muted hover:text-fg",
				children: ex.length > 42 ? ex.slice(0, 40) + "…" : ex
			}, ex))
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-xl border border-border bg-surface/90 p-3 shadow-soft backdrop-blur-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
				value: utterance,
				onChange: (e) => setUtterance(e.target.value),
				onKeyDown: (e) => {
					if (e.key === "Enter" && !e.shiftKey) {
						e.preventDefault();
						form();
					}
				},
				placeholder: "Speak or type an idea — a bookshelf, a bench, a wall of shelves…",
				rows: 2,
				className: "min-h-16 resize-none border-0 bg-transparent px-1 py-1"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 flex flex-wrap items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "button",
						variant: "blob",
						onClick: () => form(),
						disabled: phase === "forming",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WandSparkles, {}), "Form it"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "button",
						variant: listening ? "default" : "ghost",
						onClick: toggleMic,
						"aria-pressed": listening,
						className: cn(listening && "bg-blocked text-bg"),
						children: [listening ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Square, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mic, {}), listening ? "Stop" : "Speak"]
					}),
					aiOn && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "button",
						variant: "ghost",
						onClick: onRefine,
						disabled: refining || !utterance.trim(),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, {}), refining ? "Listening deeper" : "Listen deeper"]
					}),
					lastError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-blocked",
						children: lastError
					})
				]
			})]
		})]
	});
}
var badgeVariants = cva("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium tracking-wide", {
	variants: { tone: {
		default: "bg-elevated text-muted",
		ready: "bg-ready/15 text-ready",
		caution: "bg-caution/15 text-caution",
		blocked: "bg-blocked/15 text-blocked",
		blob: "bg-blob/15 text-blob"
	} },
	defaultVariants: { tone: "default" }
});
function Badge({ className, tone, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn(badgeVariants({ tone }), className),
		...props
	});
}
function Input({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		className: cn("h-11 w-full rounded-md border border-border bg-elevated px-3 text-sm text-fg tabular", "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blob/50", className),
		...props
	});
}
function Slider({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Slider$1, {
		className: cn("relative flex w-full touch-none items-center select-none", className),
		...props,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SliderTrack, {
			className: "relative h-1.5 w-full grow overflow-hidden rounded-full bg-elevated",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SliderRange, { className: "absolute h-full bg-blob" })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SliderThumb, { className: "block size-4 rounded-full border border-border-strong bg-fg shadow-soft" })]
	});
}
var Tabs = Root2;
function TabsList({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(List, {
		className: cn("flex gap-1 overflow-x-auto rounded-lg bg-elevated p-1", className),
		...props
	});
}
function TabsTrigger({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trigger, {
		className: cn("rounded-md px-3 py-1.5 text-xs font-medium text-muted whitespace-nowrap", "data-[state=active]:bg-surface data-[state=active]:text-fg", className),
		...props
	});
}
var TabsContent = Content;
function ScrollArea({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("overflow-y-auto overscroll-contain", className),
		...props
	});
}
function Separator({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("h-px w-full bg-border", className),
		...props
	});
}
function cutListCsv(result) {
	return [[
		"part",
		"qty",
		"length_mm",
		"width_mm",
		"thickness_mm",
		"material",
		"grain",
		"banded_edges",
		"mass_kg"
	], ...result.cutList.parts.map((p) => [
		p.label,
		String(p.qty),
		String(p.lengthMm),
		String(p.widthMm),
		String(p.thicknessMm),
		p.material || result.cutList.material.id,
		p.grainSensitive ? "along-length" : "none",
		(p.edgesBanded || []).join("|") || "none",
		String(p.massKg ?? "")
	])].map((r) => r.map((c) => `"${String(c).replace(/"/g, "\"\"")}"`).join(",")).join("\n");
}
function nestedSvg(result) {
	const nest = result.cutList.nesting.carcass;
	const sheet = nest.sheet;
	const gap = 40;
	const totalW = sheet.lengthMm;
	const totalH = sheet.widthMm * nest.sheetCount + gap * Math.max(0, nest.sheetCount - 1);
	return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalW} ${totalH}" width="${totalW}" height="${totalH}">
  <rect width="100%" height="100%" fill="#07080c"/>
  ${nest.sheets.map((s, si) => {
		const oy = si * (sheet.widthMm + gap);
		return `<rect x="0" y="${oy}" width="${sheet.lengthMm}" height="${sheet.widthMm}" fill="none" stroke="#8a8d94" stroke-width="2"/>` + s.parts.map((p) => `<g>
              <rect x="${p.x}" y="${oy + p.y}" width="${p.w}" height="${p.h}" fill="rgba(94,234,212,0.18)" stroke="#5eead4" stroke-width="1.2"/>
              <text x="${p.x + 8}" y="${oy + p.y + 18}" font-size="14" font-family="ui-monospace, monospace" fill="#e8e6e1">${p.id}</text>
            </g>`).join("");
	}).join("")}
</svg>`;
}
function nestedDxf(result) {
	const nest = result.cutList.nesting.carcass;
	const lines = [];
	const addRect = (x, y, w, h) => {
		const pts = [
			[x, y],
			[x + w, y],
			[x + w, y + h],
			[x, y + h],
			[x, y]
		];
		for (let i = 0; i < 4; i++) lines.push("0", "LINE", "8", "0", "10", String(pts[i][0]), "20", String(pts[i][1]), "11", String(pts[i + 1][0]), "21", String(pts[i + 1][1]));
	};
	nest.sheets.forEach((s, si) => {
		const ox = si * (nest.sheet.lengthMm + 40);
		addRect(ox, 0, nest.sheet.lengthMm, nest.sheet.widthMm);
		for (const p of s.parts) addRect(ox + p.y, p.x, p.h, p.w);
	});
	return [
		"0",
		"SECTION",
		"2",
		"HEADER",
		"9",
		"$INSUNITS",
		"70",
		"4",
		"0",
		"ENDSEC",
		"0",
		"SECTION",
		"2",
		"ENTITIES",
		...lines,
		"0",
		"ENDSEC",
		"0",
		"EOF"
	].join("\n");
}
function buildPacket(result) {
	const { spec, cutList, cost, reality, assembly, intent } = result;
	const def = cutList.checks.shelfDeflection;
	return `SOVEREIGN BLOB MANIFEST
${reality.status === "FAIL" ? "BLOCKED — DO NOT CUT AS SPECIFIED" : reality.status === "REVIEW" ? "CAUTION — REVIEW BEFORE CUTTING" : "READY FOR FABRICATION"}
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
function replayJson(result) {
	return JSON.stringify({
		utterance: result.utterance,
		intent: result.intent,
		spec: result.spec,
		stages: result.stages,
		reality: result.reality,
		rejected: result.cutList.spec.thicknessMm !== 18 ? void 0 : result.cutList.checks.shelfDeflection.pass ? void 0 : {
			tried: "18 mm",
			reason: result.cutList.flags.find((f) => f.code === "shelf-sag")?.message,
			corrections: result.reality.mitigations
		}
	}, null, 2);
}
function bandTone$1(band) {
	return band === "green" ? "ready" : band === "amber" ? "caution" : "blocked";
}
function bandLabel(band, status) {
	if (status === "FAIL") return "Blocked";
	if (status === "REVIEW") return "Caution";
	return "Ready";
}
function DimBar({ label, value }) {
	const n = value ?? 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid grid-cols-[7rem_1fr_2.5rem] items-center gap-2 text-xs",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-muted",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "h-1.5 overflow-hidden rounded-full bg-elevated",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-full rounded-full bg-blob",
					style: { width: `${Math.max(4, Math.min(100, n))}%` }
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "tabular text-right text-fg",
				children: value == null ? "—" : Math.round(n)
			})
		]
	});
}
function Inspector({ aiOn }) {
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
	const [why, setWhy] = (0, import_react.useState)(null);
	const [asking, setAsking] = (0, import_react.useState)(false);
	if (!result) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full flex-col justify-center px-6 text-sm text-muted",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-display text-xl text-fg",
			children: "Nothing has formed yet."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 leading-relaxed",
			children: "Speak or type a thing you want to make. The blob will listen, shape, then check whether it can physically exist."
		})]
	});
	const { spec, reality, cutList, cost, assembly, intent } = result;
	const def = cutList.checks.shelfDeflection;
	const tip = cutList.checks.tipOver;
	const askWhy = async () => {
		setAsking(true);
		try {
			const out = await explainReality({ data: { summary: [
				`Design: ${spec.kind} ${spec.widthMm}×${spec.heightMm}×${spec.depthMm} mm, ${spec.thicknessMm} mm ${cutList.material.label}, ${spec.shelves} shelves, span ${cutList.spanMm} mm.`,
				`Sag immediate ${def.immediateMm} mm, long-term ${def.longTermMm} mm, allowance ${def.limitMm} mm, utilisation ${Math.round(def.utilisation * 100)}%, pass ${def.pass}.`,
				`E assumed ${cutList.material.E} MPa, verified ${cutList.material.verified}.`,
				`Tip-over margin ${tip.margin}, anchored ${spec.anchored}.`,
				`Score ${reality.score} ${reality.status}. Issues: ${reality.issues.join(" ") || "none"}. Mitigations: ${reality.mitigations.join(" ") || "none"}.`,
				`Cost ${cost.total} ${cost.currency}, unpriced ${cost.unpriced.length}.`
			].join("\n") } });
			setWhy(out.ok ? out.text : out.error);
		} finally {
			setAsking(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full min-h-0 flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex items-start justify-between gap-3 px-5 pt-5 pb-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] tracking-[0.18em] text-muted uppercase",
						children: "Reality score"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-1 flex items-baseline gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-display text-4xl tabular leading-none text-fg",
							children: reality.score
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							tone: bandTone$1(reality.band),
							children: bandLabel(reality.band, reality.status)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-muted",
						children: reality.status === "FAIL" ? "Do not cut as specified." : reality.status === "REVIEW" ? "Buildable with the listed mitigations." : "Buildable as drawn."
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "button",
					variant: "ghost",
					size: "sm",
					onClick: snapshot,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, {}), " Snapshot"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
				value: tab,
				onValueChange: setTab,
				className: "flex min-h-0 flex-1 flex-col",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
					className: "mx-4 mt-3 shrink-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "reality",
							children: "Reality"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "structure",
							children: "Structure"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "cut",
							children: "Cut list"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "cost",
							children: "Cost"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "assemble",
							children: "Assemble"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "dream",
							children: "Dream"
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ScrollArea, {
					className: "min-h-0 flex-1 px-5 py-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
							value: "reality",
							className: "space-y-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DimBar, {
											label: "Physics",
											value: reality.dimensions.physics
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DimBar, {
											label: "Safety",
											value: reality.dimensions.safety
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DimBar, {
											label: "Making",
											value: reality.dimensions.manufacturability
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DimBar, {
											label: "Cost",
											value: reality.dimensions.cost
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DimBar, {
											label: "Complexity",
											value: reality.dimensions.complexity
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DimBar, {
											label: "Energy",
											value: reality.dimensions.energy
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
									className: "overflow-x-auto rounded-lg bg-elevated p-3 font-mono text-[11px] leading-5 text-blob",
									children: intent.graph
								}),
								intent.openQuestions.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mb-2 text-xs tracking-wide text-muted uppercase",
									children: "Assumed, not understood"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "space-y-1.5 text-sm",
									children: intent.openQuestions.map((q) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
										className: "text-fg/90",
										children: q.question
									}, q.slot))
								})] }),
								reality.issues.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "space-y-2",
									children: reality.issues.map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "rounded-md bg-blocked/10 px-3 py-2 text-sm text-blocked",
										children: i
									}, i))
								}),
								reality.mitigations.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "space-y-2",
									children: reality.mitigations.map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "rounded-md bg-blob/10 px-3 py-2 text-sm text-blob",
										children: i
									}, i))
								}),
								aiOn && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									type: "button",
									variant: "ghost",
									size: "sm",
									onClick: askWhy,
									disabled: asking,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, {}), asking ? "Tracing…" : "Why these numbers?"]
								}),
								why && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm leading-relaxed text-fg/90",
									children: why
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
							value: "structure",
							className: "space-y-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3 text-sm",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
											className: "space-y-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-xs text-muted",
												children: "Width mm"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												type: "number",
												value: spec.widthMm,
												onChange: (e) => applySpec({ widthMm: Number(e.target.value) })
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
											className: "space-y-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-xs text-muted",
												children: "Height mm"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												type: "number",
												value: spec.heightMm,
												onChange: (e) => applySpec({ heightMm: Number(e.target.value) })
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
											className: "space-y-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-xs text-muted",
												children: "Depth mm"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												type: "number",
												value: spec.depthMm,
												onChange: (e) => applySpec({ depthMm: Number(e.target.value) })
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
											className: "space-y-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-xs text-muted",
												children: "Shelves"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												type: "number",
												min: 2,
												value: spec.shelves,
												onChange: (e) => applySpec({ shelves: Number(e.target.value) })
											})]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mb-2 text-xs text-muted",
									children: "Stock thickness"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex flex-wrap gap-2",
									children: MATERIALS[spec.material].thicknessesMm.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: () => applySpec({ thicknessMm: t }),
										className: `h-10 rounded-md px-3 text-sm tabular ${spec.thicknessMm === t ? "bg-fg text-bg" : "border border-border text-fg"}`,
										children: [t, " mm"]
									}, t))
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mb-2 text-xs text-muted",
										children: "Material"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "flex flex-wrap gap-2",
										children: Object.keys(MATERIALS).map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: () => applySpec({ material: id }),
											className: `h-10 rounded-md px-3 text-xs ${spec.material === id ? "bg-fg text-bg" : "border border-border text-fg"}`,
											children: MATERIALS[id].label.split(" ")[0]
										}, id))
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-2 text-xs text-muted",
										children: [
											cutList.material.label,
											". E = ",
											cutList.material.E,
											" MPa · handbook, not a datasheet."
										]
									})
								] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => applySpec({ anchored: !spec.anchored }),
									className: `flex h-11 w-full items-center justify-center gap-2 rounded-md border text-sm ${spec.anchored ? "border-blob bg-blob/10 text-blob" : "border-border"}`,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Anchor, { className: "size-4" }), spec.anchored ? "Anchored to the wall" : "Freestanding — wall fix off"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-lg border border-border p-3 text-sm",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "tabular",
											children: [
												"Long-term sag ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [def.longTermMm, " mm"] }),
												" vs allowance ",
												def.limitMm,
												" mm"
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "mt-1 text-muted",
											children: [
												"Span ",
												cutList.spanMm,
												" mm · ",
												def.pass ? "passes L/360" : "fails L/360",
												" · mass ",
												cutList.totalMassKg,
												" kg"
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "mt-1 text-muted",
											children: [
												"Tip-over margin ",
												tip.margin,
												" · rear drop ",
												tip.rearDropMm,
												" mm gains ",
												tip.marginGain ?? 0
											]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mb-2 flex items-center justify-between text-xs text-muted",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
										"After ",
										ageYears,
										" years"
									] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "tabular",
										children: "creep toward 2× immediate sag"
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
									min: 0,
									max: 10,
									step: 1,
									value: [ageYears],
									onValueChange: (v) => setAgeYears(v[0] ?? 0)
								})] }),
								result.alternatives.slice(0, 3).map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => applySpec({ material: a.id }),
									className: "block w-full rounded-md border border-border px-3 py-2 text-left text-sm hover:bg-elevated",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-fg",
										children: a.label
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "mt-0.5 block text-xs text-muted",
										children: [
											"stiffness ×",
											a.stiffnessVsPrimary,
											" · mass ×",
											a.massVsPrimary,
											" · ",
											a.reason
										]
									})]
								}, a.id))
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
							value: "cut",
							className: "space-y-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
									className: "w-full text-left text-xs",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
										className: "text-muted",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "py-1 font-medium",
												children: "Part"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "py-1 font-medium tabular",
												children: "Qty"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "py-1 font-medium tabular",
												children: "L × W × T"
											})
										] })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: cutList.parts.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
										className: "border-t border-border",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "py-2 pr-2",
												children: p.label
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "tabular",
												children: p.qty
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
												className: "tabular text-muted",
												children: [
													p.lengthMm,
													" × ",
													p.widthMm,
													" × ",
													p.thicknessMm
												]
											})
										]
									}, p.id)) })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs text-muted",
									children: [
										"Nesting ",
										cutList.nesting.carcassSheetCount,
										" sheet(s) · ",
										Math.round(cutList.nesting.carcass.overallUtilisation * 100),
										"% yield · grain locked"
									]
								}),
								cutList.nesting.carcass.sheets.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
									viewBox: `0 0 ${cutList.nesting.carcass.sheet.lengthMm} ${cutList.nesting.carcass.sheet.widthMm}`,
									className: "w-full rounded-md border border-border bg-bg",
									children: s.parts.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
										x: p.x,
										y: p.y,
										width: p.w,
										height: p.h,
										fill: "rgba(94,234,212,0.16)",
										stroke: "#5eead4",
										strokeWidth: "4"
									}, p.id))
								}, s.index)),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap gap-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											type: "button",
											variant: "ghost",
											size: "sm",
											onClick: () => downloadText("cut-list.csv", cutListCsv(result), "text/csv"),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {}), " CSV"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											type: "button",
											variant: "ghost",
											size: "sm",
											onClick: () => downloadText("nested-layout.svg", nestedSvg(result), "image/svg+xml"),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {}), " SVG"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											type: "button",
											variant: "ghost",
											size: "sm",
											onClick: () => downloadText("nested-layout.dxf", nestedDxf(result), "application/dxf"),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {}), " DXF"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											type: "button",
											variant: "ghost",
											size: "sm",
											onClick: () => downloadText("SBM.txt", buildPacket(result)),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {}), " Packet"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											type: "button",
											variant: "ghost",
											size: "sm",
											onClick: () => downloadText("replay.json", replayJson(result), "application/json"),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {}), " Replay"]
										})
									]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
							value: "cost",
							className: "space-y-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex gap-2",
									children: Object.keys(REGIONS).map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => setRegion(id),
										className: `h-10 rounded-md px-3 text-xs ${region === id ? "bg-fg text-bg" : "border border-border"}`,
										children: id === "au-qld-local" ? "Gold Coast local" : "China bulk"
									}, id))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted",
									children: REGIONS[region].note
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-display text-3xl tabular",
									children: cost.unpriced.length && cost.lines.length === 0 ? "unpriced" : formatMoney(cost.total, cost.currency)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
									className: "space-y-2 text-sm",
									children: [cost.lines.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										className: "flex justify-between gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [l.label, l.basisMismatch && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "ml-2 text-caution",
											children: "bulk-tier"
										})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "tabular text-muted",
											children: [
												l.lineTotal,
												" ",
												l.currency
											]
										})]
									}, l.key)), cost.tax && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										className: "flex justify-between text-muted",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: cost.tax.label }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "tabular",
											children: [
												cost.tax.amount,
												" ",
												cost.currency
											]
										})]
									})]
								}),
								cost.unpriced.map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "rounded-md bg-caution/10 px-3 py-2 text-sm text-caution",
									children: [
										"Unpriced: ",
										u.label,
										". ",
										u.reason
									]
								}, u.key)),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted",
									children: cost.confidence.note
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
							value: "assemble",
							className: "space-y-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
								className: "space-y-4",
								children: assembly.steps.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "grid grid-cols-[2rem_1fr] gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "tabular text-muted",
										children: String(s.step).padStart(2, "0")
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-sm font-medium",
											children: s.title
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1 text-sm text-fg/85",
											children: s.detail
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "mt-1 text-xs text-muted",
											children: ["Why: ", s.reason]
										})
									] })]
								}, s.step))
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
							value: "dream",
							className: "space-y-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									type: "button",
									variant: "ghost",
									onClick: runDream,
									disabled: dreaming,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Moon, {}), dreaming ? "Exploring…" : "Explore nearby designs"]
								}),
								dream && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-sm text-muted",
									children: [
										dream.explored,
										" variants recomputed. ",
										dream.note
									]
								}), dream.best.map((v, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => applySpec(v.change),
									className: "block w-full rounded-md border border-border px-3 py-2 text-left text-sm hover:bg-elevated",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "tabular text-fg",
										children: [
											"score ",
											v.score,
											" · ",
											Object.entries(v.change).map(([k, val]) => `${k} ${String(val)}`).join(", ")
										]
									}), v.total != null && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "mt-0.5 block text-xs text-muted",
										children: formatMoney(v.total, v.currency ?? cost.currency)
									})]
								}, i))] }),
								snapshots.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mb-2 text-xs tracking-wide text-muted uppercase",
									children: "Memory crystal"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "space-y-2",
									children: snapshots.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: () => restore(s.id),
										className: "w-full rounded-md border border-border px-3 py-2 text-left text-sm hover:bg-elevated",
										children: [s.label, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "mt-0.5 block text-xs text-muted",
											children: ["score ", s.score]
										})]
									}) }, s.id))
								})] })
							]
						})
					]
				})]
			})
		]
	});
}
var Sheet = Dialog;
function SheetContent({ className, children, side = "bottom", title = "Panel", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, { className: "fixed inset-0 z-40 bg-bg/70" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
		className: cn("fixed z-50 flex flex-col bg-surface text-fg shadow-soft", side === "bottom" ? "inset-x-0 bottom-0 max-h-[82vh] rounded-t-2xl border-t border-border" : "inset-y-0 right-0 h-full w-full max-w-md border-l border-border", className),
		...props,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
				className: "sr-only",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex justify-end p-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogClose, {
					className: "grid size-11 place-items-center rounded-md text-muted hover:text-fg",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
				})
			}),
			children
		]
	})] });
}
function bandTone(band) {
	if (band === "green") return "ready";
	if (band === "amber") return "caution";
	if (band === "red") return "blocked";
	return "default";
}
function Forge() {
	const phase = useBlobStore((s) => s.phase);
	const result = useBlobStore((s) => s.result);
	const inspectorOpen = useBlobStore((s) => s.inspectorOpen);
	const setInspectorOpen = useBlobStore((s) => s.setInspectorOpen);
	const hydrate = useBlobStore((s) => s.hydrate);
	const [aiOn, setAiOn] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		hydrate();
		aiStatus().then((s) => setAiOn(s.available)).catch(() => setAiOn(false));
	}, [hydrate]);
	const score = result?.reality.score;
	const band = result?.reality.band;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative isolate flex min-h-dvh flex-col bg-bg text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between p-4 md:p-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "pointer-events-auto",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-2xl leading-none md:text-3xl",
						children: "Sovereign Blob"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 max-w-xs text-xs text-muted md:text-sm",
						children: "Imagination, compiled against physics."
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "pointer-events-auto flex items-center gap-2",
					children: [
						score != null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
							tone: bandTone(band),
							className: "tabular",
							children: [
								score,
								" · ",
								result?.reality.status
							]
						}),
						phase === "listening" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							tone: "blob",
							children: "Listening"
						}),
						phase === "forming" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							tone: "blob",
							children: "Forming"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "ghost",
							size: "icon",
							className: "lg:hidden",
							"aria-label": "Open inspector",
							onClick: () => setInspectorOpen(true),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelRight, {})
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-h-dvh flex-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative min-h-dvh min-w-0 flex-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BlobCanvas, {}),
						phase === "idle" && !result && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "pointer-events-none absolute inset-0 flex items-center justify-center px-6",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "max-w-md text-center font-display text-3xl leading-tight text-fg/90 md:text-5xl",
								children: ["Say a thing.", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "mt-3 block font-sans text-sm font-normal tracking-normal text-muted md:text-base",
									children: "A bookshelf. A bench. A wall of shelves. The blob will form it, then refuse it if it cannot exist."
								})]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center px-3 pb-[max(1rem,env(safe-area-inset-bottom))] pt-16 md:px-6",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Composer, { aiOn })
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
					className: "hidden w-[26rem] shrink-0 border-l border-border bg-surface lg:flex lg:flex-col",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Inspector, { aiOn })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sheet, {
				open: inspectorOpen,
				onOpenChange: setInspectorOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetContent, {
					side: "bottom",
					title: "Design inspector",
					className: "lg:hidden",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-[72vh] min-h-0 overflow-hidden",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Inspector, { aiOn })
					})
				})
			})
		]
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Forge, {});
}
//#endregion
export { Home as component };
