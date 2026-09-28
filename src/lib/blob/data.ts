import type { RegionId } from "./types";

export type PriceItem = {
  label: string;
  unit: string;
  price: number | null;
  currency: string | null;
  basis: string;
  moq: number | null;
  supplier?: string | null;
  listing?: string | null;
  url?: string | null;
  note?: string;
};

export const PRICE_BOOK = {
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
      note: "Tier price for 400–999 sheets. A single-sheet retail price was not sourced.",
    },
    "sheet-25mm-birch-plywood-2440x1220": {
      label: "25 mm birch plywood sheet, 2440 × 1220 mm",
      unit: "sheet",
      price: null,
      currency: "USD",
      basis: "not-sourced",
      moq: null,
      note: "25 mm full-birch plywood was not sourced at a verifiable price.",
    },
    "sheet-6mm-back-panel": {
      label: "6 mm back-panel sheet (plywood or hardboard)",
      unit: "sheet",
      price: null,
      currency: "USD",
      basis: "not-sourced",
      moq: null,
      note: "Not sourced.",
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
      url: "https://www.amazon.com/SML-C125-500-4-Inch-Coarse-Washer-Head-500-Pack/dp/B0002QZ4XK",
    },
    "pocket-hole-jig-kit": {
      label: "Pocket-hole jig kit, 3/8\" (Kreg)",
      unit: "kit",
      price: 24.98,
      currency: "USD",
      basis: "retail",
      moq: 1,
      supplier: "Kreg",
    },
    "wall-anchor-kit-4pack": {
      label: "Anti-tip / furniture-to-wall anchor kit (4 anchors)",
      unit: "pack",
      price: 65,
      currency: "AUD",
      basis: "retail",
      moq: 1,
      supplier: "Bladopia via Desertcart AU",
      note: "Priced in AUD. In a USD total this line is reported separately, not converted.",
    },
    "dowel-pins-44mm-250ct": {
      label: "Fluted wooden dowel pins, pack of 250",
      unit: "pack of 250",
      price: 9.54,
      currency: "USD",
      basis: "retail",
      moq: 1,
    },
    "confirmat-screws-7x50": {
      label: "Confirmat furniture screws 7 × 50 mm",
      unit: "piece",
      price: null,
      currency: "USD",
      basis: "not-sourced",
      moq: null,
      note: "No listing with a verifiable price was found.",
    },
    "sheet-18mm-plywood-au-local": {
      label: "18 mm plywood sheet, 2400 × 1200 mm (locally supplied, cabinet grade)",
      unit: "sheet",
      price: 135.0,
      currency: "AUD",
      basis: "retail-classifieds",
      moq: 1,
      supplier: "Gold Coast region seller (classifieds)",
      listing: "Gumtree QLD",
      url: "https://www.gumtree.com.au/s-home-garden/gold-coast/plywood+sheets/k0c18397l3006035",
      note: "Classifieds figure, not a trade quote. The bureau's own quote must replace this line.",
    },
    "sheet-6mm-plywood-au-local": {
      label: "6 mm plywood sheet (back panel, local AU supply)",
      unit: "sheet",
      price: null,
      currency: "AUD",
      basis: "not-sourced",
      moq: null,
      note: "No 6 mm plywood price was found for the Gold Coast region.",
    },
    "cut-to-size-cnc-service": {
      label: "CNC / laser cut-to-size bureau",
      unit: "job",
      price: null,
      currency: null,
      basis: "quote-based",
      moq: 1,
      note: "Quote-based by nature. The engine produces the DXF; it does not invent a cut-service price.",
    },
  } as Record<string, PriceItem>,
};

export type RegionProfile = {
  id: RegionId;
  label: string;
  supplyMode: string;
  currency: string;
  sheetMm: { lengthMm: number; widthMm: number };
  carcassSheetPriceKey: string;
  backPanelPriceKey: string;
  gstRate: number;
  freightModelled: boolean;
  cutServiceIncluded: boolean;
  note: string;
};

export const REGIONS: Record<RegionId, RegionProfile> = {
  "cn-bulk": {
    id: "cn-bulk",
    label: "China bulk supply",
    supplyMode: "supply-chain",
    currency: "USD",
    sheetMm: { lengthMm: 2440, widthMm: 1220 },
    carcassSheetPriceKey: "sheet-18mm-birch-plywood-2440x1220",
    backPanelPriceKey: "sheet-6mm-back-panel",
    gstRate: 0,
    freightModelled: false,
    cutServiceIncluded: false,
    note: "Container-tier pricing. Freight, customs and duty are not modelled. MOQ is ~400 sheets.",
  },
  "au-qld-local": {
    id: "au-qld-local",
    label: "Gold Coast QLD, local fabrication",
    supplyMode: "local-fabrication",
    currency: "AUD",
    sheetMm: { lengthMm: 2400, widthMm: 1200 },
    carcassSheetPriceKey: "sheet-18mm-plywood-au-local",
    backPanelPriceKey: "sheet-6mm-plywood-au-local",
    gstRate: 0.1,
    freightModelled: false,
    cutServiceIncluded: false,
    note: "Local bureau holds stock — no MOQ, no freight leg. The 18 mm sheet price is a classifieds figure and is the weakest number in the chain.",
  },
};

export function resolveRegion(id?: RegionId | RegionProfile | null): RegionProfile | null {
  if (!id) return null;
  if (typeof id === "object") return id;
  return REGIONS[id] ?? null;
}

export function regionSheet(region: RegionProfile | null) {
  if (!region?.sheetMm) return null;
  return { lengthMm: region.sheetMm.lengthMm, widthMm: region.sheetMm.widthMm };
}
