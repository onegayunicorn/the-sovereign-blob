import type { Joinery, JoineryId, Material } from "./types";

export const JOINERY: Record<Exclude<JoineryId, "none">, Omit<Joinery, "selectedBecause" | "substituted">> = {
  "pocket-screw": {
    id: "pocket-screw",
    label: "Pocket screws (angled, jig-drilled)",
    needsThicknessMm: 15,
    suits: ["birch-plywood", "poplar-plywood", "solid-pine", "bamboo"],
    tooling: ["pocket-hole jig", "step drill bit", "driver bit", "clamp"],
    fastener: { id: "pocket-screw-32", label: "Pocket-hole screw 32 mm (coarse, washer head)", lengthMm: 32 },
    spacingMm: 100,
    edgeDistanceMm: 32,
    reason: "Fast, strong in plywood and solid timber, fully demountable, needs no clamp-up time.",
  },
  confirmat: {
    id: "confirmat",
    label: "Confirmat (furniture) screws",
    needsThicknessMm: 18,
    suits: ["mdf", "birch-plywood", "poplar-plywood"],
    tooling: ["5 mm pilot drill", "countersink or step drill", "driver bit"],
    fastener: { id: "confirmat-50", label: "Confirmat screw 7 x 50 mm", lengthMm: 50 },
    spacingMm: 150,
    edgeDistanceMm: 34,
    reason: "Designed for engineered board; will not strip an MDF or particleboard edge.",
  },
  dado: {
    id: "dado",
    label: "Dado / groove (housing joint)",
    needsThicknessMm: 12,
    suits: ["birch-plywood", "poplar-plywood", "mdf", "solid-pine"],
    tooling: ["router or table saw with dado stack", "straight cutter matched to panel thickness", "clamps"],
    fastener: { id: "glue-pva", label: "PVA wood glue (D3)", lengthMm: null },
    spacingMm: null,
    edgeDistanceMm: null,
    reason: "Locates the panel, adds glue area, and carries load through the full board thickness.",
  },
  dowel: {
    id: "dowel",
    label: "Dowel joints",
    needsThicknessMm: 12,
    suits: ["birch-plywood", "solid-pine", "bamboo"],
    tooling: ["dowel jig or dowel centres", "8 mm brad-point bit", "mallet"],
    fastener: { id: "dowel-8x30", label: "Fluted dowel 8 x 30 mm", lengthMm: 30 },
    spacingMm: 120,
    edgeDistanceMm: 24,
    reason: "Invisible joint, no fastener heads, good for glue-up of solid timber and plywood.",
  },
  cam: {
    id: "cam",
    label: "Cam and dowel (knock-down)",
    needsThicknessMm: 18,
    suits: ["mdf", "birch-plywood", "poplar-plywood"],
    tooling: ["cam boring bit", "dowel drilling jig", "screwdriver"],
    fastener: { id: "cam-dowel-15", label: "15 mm cam lock + 24 mm dowel", lengthMm: 24 },
    spacingMm: 192,
    edgeDistanceMm: 34,
    reason: "Flat-pack friendly: assembles with a screwdriver, ships flat, re-assembles after moving.",
  },
};

export function selectJoinery({
  material,
  thicknessMm,
  requested,
  knockdown = false,
}: {
  material: Material;
  thicknessMm: number;
  requested?: JoineryId | null;
  knockdown?: boolean;
}): Joinery {
  const candidates = Object.values(JOINERY);
  const valid = candidates.filter(
    (j) => j.suits?.includes(material.id) && thicknessMm >= (j.needsThicknessMm ?? 0),
  );

  if (requested && JOINERY[requested as Exclude<JoineryId, "none">]) {
    const want = JOINERY[requested as Exclude<JoineryId, "none">];
    if (valid.some((j) => j.id === want.id)) {
      return { ...want, selectedBecause: "user requested it and it is valid for this material and thickness", substituted: false };
    }
    const replacement = valid[0];
    return {
      ...(replacement || want),
      selectedBecause: replacement
        ? `${want.label} is not suitable here; using ${replacement.label} instead.`
        : "no joint method in the library is valid for this material and thickness",
      substituted: true,
      requested: want.id,
    };
  }

  const preferred = knockdown
    ? valid.find((j) => j.id === "cam")
    : valid.find((j) => j.id === (material.id === "mdf" ? "confirmat" : "pocket-screw"));
  const chosen = preferred || valid[0];
  if (!chosen) {
    return { id: "none", label: "No valid joint", selectedBecause: "material/thickness combination is outside the joinery library", substituted: false };
  }
  return {
    ...chosen,
    selectedBecause:
      material.id === "mdf" && chosen.id === "confirmat"
        ? "MDF edge-screwing pulls out; confirmat screws are the engineered-board standard."
        : knockdown && chosen.id === "cam"
          ? "knock-down requested, so a cam-and-dowel joint assembles with a screwdriver."
          : `valid for ${material.label} at ${thicknessMm} mm and the fastest option that stays rigid.`,
    substituted: false,
  };
}

export function fastenerCountFor(lineLengthMm: number, joinery: Joinery) {
  if (!joinery.spacingMm) return null;
  const usable = Math.max(0, lineLengthMm - 2 * (joinery.edgeDistanceMm || 0));
  return Math.max(2, Math.round(usable / joinery.spacingMm) + 1);
}
