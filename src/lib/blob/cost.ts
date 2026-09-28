import { round2 } from "@/lib/utils";
import { PRICE_BOOK, type RegionProfile, resolveRegion } from "./data";
import type { CostLine, CostResult, CutList, RegionId } from "./types";

export function costBuild(
  cutList: CutList,
  options: { region?: RegionId | RegionProfile | null; currency?: string } = {},
): CostResult {
  const book = PRICE_BOOK;
  const region = resolveRegion(options.region ?? null);
  const currency = options.currency || region?.currency || book.defaultCurrency;
  const lines: CostLine[] = [];
  const unpriced: CostResult["unpriced"] = [];
  const otherCurrency: CostLine[] = [];

  const add = (key: string, qty: number, role: string, extra: Partial<CostLine> = {}) => {
    const item = book.items[key];
    if (!item) {
      unpriced.push({ key, qty, role, label: key, reason: "not present in price book" });
      return;
    }
    if (item.price == null) {
      unpriced.push({ key, qty, role, label: item.label, reason: item.note || "not sourced", url: item.url ?? undefined });
      return;
    }
    const line: CostLine = {
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
      ...extra,
    };
    if (item.currency && item.currency !== currency) otherCurrency.push(line);
    else lines.push(line);
  };

  const t = cutList.spec.thicknessMm;
  const carcassKey = region?.carcassSheetPriceKey || `sheet-${t}mm-birch-plywood-2440x1220`;
  const thicknessMismatch = /18mm/.test(carcassKey) && t !== 18;

  if (thicknessMismatch) {
    unpriced.push({
      key: carcassKey,
      qty: cutList.nesting.carcassSheetCount,
      role: "material",
      label: `${t} mm ${cutList.material.label} sheet`,
      reason: `Price book only has a sourced figure for 18 mm. ${t} mm is unpriced — a made-up number would propagate into every design that follows.`,
    });
  } else if (book.items[carcassKey]) {
    add(carcassKey, cutList.nesting.carcassSheetCount, "material");
  } else {
    unpriced.push({
      key: carcassKey,
      qty: cutList.nesting.carcassSheetCount,
      role: "material",
      label: `${t} mm ${cutList.material.label} sheet`,
      reason: region
        ? `no sourced price for region "${region.id}" at this thickness`
        : "no sourced price for this thickness — only 18 mm was priced",
    });
  }

  if (cutList.nesting.backSheetCount) {
    add(region?.backPanelPriceKey || "sheet-6mm-back-panel", cutList.nesting.backSheetCount, "material");
  }

  const j = cutList.joinery;
  if (j.id === "pocket-screw") {
    const totalScrews = cutList.fasteners.reduce((s, f) => s + f.count, 0);
    add("pocket-screws-32mm-500ct", Math.max(1, Math.ceil(totalScrews / 500)), "consumable", {
      note: `prorated from a 500-count pack for ${totalScrews} screws`,
    });
  } else if (j.id === "confirmat") {
    const totalScrews = cutList.fasteners.reduce((s, f) => s + f.count, 0);
    add("confirmat-screws-7x50", totalScrews, "consumable");
  } else if (j.id === "dowel") {
    const totalDowels = cutList.fasteners.reduce((s, f) => s + f.count, 0);
    add("dowel-pins-44mm-250ct", Math.max(1, Math.ceil(totalDowels / 250)), "consumable");
  }

  if (cutList.checks.tipOver.anchoredRequired) {
    add("wall-anchor-kit-4pack", 1, "safety");
  }

  const tools: CostLine[] = [];
  if (j.id === "pocket-screw") {
    const kit = book.items["pocket-hole-jig-kit"];
    if (kit && kit.price != null) {
      tools.push({
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
        note: "one-off tool purchase; reusable across builds",
      });
    }
  }

  let tax: CostResult["tax"] = null;
  if (region?.gstRate) {
    const subtotal = round2(lines.reduce((s, l) => s + l.lineTotal, 0));
    tax = {
      label: `GST ${(region.gstRate * 100).toFixed(0)}%`,
      rate: region.gstRate,
      amount: round2(subtotal * region.gstRate),
    };
  }

  const total = round2(lines.reduce((s, l) => s + l.lineTotal, 0) + (tax?.amount ?? 0));
  const toolTotal = round2(tools.reduce((s, l) => s + l.lineTotal, 0));
  const mismatched = lines.filter((l) => l.basisMismatch);

  return {
    asOf: book.asOf,
    currency,
    region: region
      ? {
          id: region.id,
          label: region.label,
          supplyMode: region.supplyMode,
          sheetMm: region.sheetMm,
          freightModelled: region.freightModelled,
          cutServiceIncluded: region.cutServiceIncluded,
        }
      : null,
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
      note:
        unpriced.length || mismatched.length
          ? "This is a partial cost. See unpriced lines and bulk-tier mismatches — nothing here is estimated."
          : "All lines priced from verified listings.",
    },
  };
}
