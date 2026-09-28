import type { Material, MaterialId } from "./types";

export const MATERIALS: Record<MaterialId, Material> = {
  "birch-plywood": {
    id: "birch-plywood",
    label: "Full-birch plywood (interior/exterior glue)",
    E: 10300,
    density: 680,
    thicknessesMm: [12, 15, 18, 21, 25],
    verified: false,
    source: null,
    provenance: "Typical handbook value for plywood bending MOE (approx. 1.5e6 psi).",
    grainSensitive: true,
    notes: "Cut across face grain for narrow shelves; grain runs along the long dimension of a panel.",
  },
  "poplar-plywood": {
    id: "poplar-plywood",
    label: "Poplar-core plywood / hardwood ply",
    E: 8600,
    density: 600,
    thicknessesMm: [12, 15, 18, 21, 25],
    verified: false,
    source: null,
    provenance: "Typical handbook value for soft-core plywood, lower stiffness than full birch.",
    grainSensitive: true,
    notes: "Cheaper, less stiff, better screw holding than MDF.",
  },
  mdf: {
    id: "mdf",
    label: "MDF (medium-density fibreboard)",
    E: 3600,
    density: 750,
    thicknessesMm: [12, 15, 18, 22, 25],
    verified: false,
    source: null,
    provenance: "Typical handbook value for MDF bending MOE.",
    grainSensitive: false,
    notes: "No grain direction. Poor screw holding in edge; use confirmat/cam-dowel or biscuits.",
  },
  "solid-pine": {
    id: "solid-pine",
    label: "Solid pine / softwood timber",
    E: 10000,
    density: 510,
    thicknessesMm: [18, 20, 25, 30, 40],
    verified: false,
    source: null,
    provenance: "Typical handbook value for softwood timber bending MOE.",
    grainSensitive: true,
    notes: "Moves with humidity. Allow for seasonal movement; do not glue a wide panel to a cross rail.",
  },
  bamboo: {
    id: "bamboo",
    label: "Bamboo laminate / strand board",
    E: 12000,
    density: 700,
    thicknessesMm: [15, 18, 20, 25],
    verified: false,
    source: null,
    provenance: "Typical reported range for bamboo laminate; varies widely by strand orientation.",
    grainSensitive: true,
    notes: "Higher stiffness per mm than plywood in the fibre direction; verify orientation.",
  },
  "steel-mild": {
    id: "steel-mild",
    label: "Mild steel (S235 / A36 class)",
    E: 200000,
    density: 7850,
    thicknessesMm: [1.5, 2, 3, 4, 6],
    verified: false,
    source: null,
    provenance: "Standard handbook value for mild steel.",
    grainSensitive: false,
    notes: "Dominated by weight and finishing cost for furniture. Check the mass trade-off.",
  },
  aluminium: {
    id: "aluminium",
    label: "Aluminium (6061-T6 class)",
    E: 69000,
    density: 2700,
    thicknessesMm: [1.5, 2, 3, 5, 6],
    verified: false,
    source: null,
    provenance: "Standard handbook value for 6061-T6.",
    grainSensitive: false,
    notes: "Roughly one third of steel stiffness but about a third of the weight.",
  },
};

const ALIASES: Record<string, MaterialId> = {
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
  oak: "solid-pine",
};

export function resolveMaterial(nameOrId?: string | null): Material {
  if (!nameOrId) return MATERIALS["birch-plywood"];
  const key = String(nameOrId).trim().toLowerCase();
  if (key in MATERIALS) return MATERIALS[key as MaterialId];
  if (ALIASES[key]) return MATERIALS[ALIASES[key]];
  for (const m of Object.values(MATERIALS)) {
    if (m.label.toLowerCase().includes(key)) return m;
  }
  return MATERIALS["birch-plywood"];
}

export function nearestThickness(material: Material, requestedMm?: number | null) {
  if (!requestedMm) return material.thicknessesMm.includes(18) ? 18 : material.thicknessesMm[0];
  let best = material.thicknessesMm[0];
  for (const t of material.thicknessesMm) {
    if (Math.abs(t - requestedMm) < Math.abs(best - requestedMm)) best = t;
  }
  return best;
}

export function boardMassKg(material: Material, thicknessMm: number, widthMm: number, lengthMm: number) {
  const volumeM3 = (thicknessMm / 1000) * (widthMm / 1000) * (lengthMm / 1000);
  return volumeM3 * material.density;
}

export function alternativesFor(materialId: string) {
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
      reason:
        stiffnessRatio > 1.05 && massRatio < 1.05
          ? "stiffer and lighter"
          : stiffnessRatio > 1.05
            ? "stiffer but heavier"
            : stiffnessRatio < 0.95 && massRatio < 0.95
              ? "lighter but less stiff"
              : "similar stiffness, different cost/finish profile",
    });
  }
  return out.sort((a, b) => b.stiffnessVsPrimary - a.stiffnessVsPrimary);
}
