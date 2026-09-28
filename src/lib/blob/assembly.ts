import { resolveMaterial } from "./materials";
import type { Assembly, CutList } from "./types";

export function buildAssemblySequence(cutList: CutList): Assembly {
  const { spec, joinery, material, checks } = cutList;
  const mat = resolveMaterial(material.id);
  const steps: Assembly["steps"] = [];
  let n = 0;
  const step = (title: string, detail: string, reason: string, tools: string[] = []) =>
    steps.push({ step: ++n, title, detail, reason, tools });

  step(
    "Verify the material and the sag margin before cutting",
    `Measure the actual sheet: nominal ${spec.thicknessMm} mm commonly runs thinner. Re-run the deflection figure with measured thickness.${checks.shelfDeflection.pass ? "" : " This design already fails the sag check — resolve that before cutting timber."}`,
    "Sheet goods are undersize more often than not, and every downstream dimension depends on the real thickness.",
    ["calipers or vernier", "pencil"],
  );

  const tip = checks.tipOver;
  if (tip && tip.rearDropMm > 0 && spec.kind !== "table") {
    step(
      "Relieve the rear bottom edge to set the backward lean",
      `Shorten the rear support by ${tip.rearDropMm} mm on each side panel. At ${spec.depthMm} mm depth that leans the unit back ${tip.tiltDeg}° and moves the centre of mass ${tip.comShiftMm} mm toward the wall.`,
      `Tip-over margin goes from ${tip.marginWithoutRearDrop} to ${tip.margin} (still below 1, so the wall fixing is mandatory). The lean also makes books rest against the wall instead of tipping forward.`,
      ["plane or saw", "spirit level"],
    );
  }

  step(
    "Break down the sheet into parts",
    `Cut ${cutList.nesting.carcassSheetCount} sheet(s) of ${spec.thicknessMm} mm ${mat.label}. Use the nested layout — do not re-nest by eye. Keep each part labelled on the back face.`,
    "The nesting already accounts for grain direction; re-cutting by eye is how grain direction gets flipped.",
    ["circular saw or table saw", "straight edge", "clamps", "safety glasses", "hearing protection"],
  );

  if (spec.backPanel) {
    step(
      "Cut the back panel",
      `Cut the ${spec.backThicknessMm} mm back panel to ${spec.heightMm} × ${spec.widthMm} mm. Square it to the carcass.`,
      "The back panel is the anti-racking member, so it has to actually fit the assembled carcass.",
      ["saw", "square"],
    );
  }

  step(
    "Label and orient every part",
    spec.kind === "table"
      ? `Grain on the top runs along the ${spec.widthMm} mm length. Legs: grain vertical.`
      : `Mark which face is "out" on the two side panels and keep the grain running vertically. Shelves: grain along the ${cutList.spanMm} mm span.`,
    "Plywood grain is directional. Flipping a part after drilling puts the pocket holes on the visible face.",
    ["pencil", "masking tape"],
  );

  if (joinery.id === "pocket-screw") {
    step(
      "Drill pocket holes",
      `Set the jig for ${spec.thicknessMm} mm stock. Interior horizontals get pocket holes on the underside, two per end, at least ${joinery.edgeDistanceMm} mm from the end.`,
      "Pocket screws are drilled before assembly; you cannot drill a closed box.",
      joinery.tooling ?? [],
    );
  } else if (joinery.id === "dado") {
    step(
      "Cut the dados",
      `Route or saw ${spec.thicknessMm} mm wide grooves in both side panels at each shelf position. Depth: one third of the panel width (${Math.round(spec.depthMm / 3)} mm). Test on an offcut first.`,
      "A dado must match the actual panel thickness, which is why it is cut after measuring the sheet.",
      joinery.tooling ?? [],
    );
  } else if (joinery.id === "confirmat") {
    step(
      "Drill confirmat pilot holes",
      "5 mm pilot through the side panel, 7 mm clearance in the mating part, with a shallow countersink. Pilot depth 42 mm for a 50 mm screw.",
      "Confirmat screws need the stepped pilot or they crush the board face.",
      joinery.tooling ?? [],
    );
  } else if (joinery.id === "cam") {
    step(
      "Bore cam housings and dowel holes",
      "Bore 15 mm cam housings in the side panels and matching 8 mm dowel holes in the shelf ends, using one reference edge for every part.",
      "Knock-down hardware only lines up if every part is bored off the same reference.",
      joinery.tooling ?? [],
    );
  }

  if (spec.kind === "table") {
    step(
      "Assemble the apron frame, then the top",
      "Join the four aprons to the four legs, check diagonals within 1 mm, then screw the top from below through the aprons so no fastener shows on the working face.",
      "A racked frame cannot be pulled square by the top — the top holds it square.",
      ["clamps", "tape measure", "driver"],
    );
  } else {
    step(
      "Assemble the carcass flat, then square it",
      `Join one side, all ${spec.shelves} horizontals and the second side. Measure both diagonals of the assembled box: they must match within 1 mm before you tighten anything.`,
      "A racked carcass cannot be corrected by the back panel — the back holds it square, it does not pull it square.",
      ["clamps", "tape measure or diagonal gauge", "driver"],
    );
  }

  if (spec.backPanel) {
    step(
      "Fix the back panel",
      "Glue and pin the back panel to the rear edges of the carcass. Pins every 150 mm. Check the diagonals again after fixing.",
      "The back panel turns four hinges into a shear diaphragm; this is the single step that makes the box rigid.",
      ["panel pins or staples", "hammer or stapler", "glue"],
    );
  }

  if (spec.plinth) {
    step(
      `Fit the ${spec.plinthHeightMm} mm plinth`,
      "Fit the front rail flush with the bottom shelf front edge, inset 10 mm from the front face so it reads as a shadow line.",
      "A recessed plinth hides the floor line and stops the unit rocking on an uneven floor.",
      ["clamps", "driver"],
    );
  }

  step(
    "Band the exposed edges",
    `Iron on edge banding to the front edges: ${cutList.edgeBandingMm} mm of banding in total. Trim flush and ease the corners with 120–180 grit.`,
    "Bare plywood edges telegraph every void in the core and absorb moisture faster than the face.",
    ["iron", "edge trimmer", "120–180 grit abrasive block"],
  );

  step(
    "Finish",
    `Sand to 180 grit, then apply ${mat.id === "mdf" ? "a sealing primer before any water-based finish (MDF edges drink it)" : "a hard-wax oil or water-based lacquer"}. Leave to cure fully before loading.`,
    "Finishing is the last step because sanding dust ruins a finish and a finish ruins a glue-up.",
    ["sander", "tack cloth", "brush"],
  );

  if (spec.kind !== "table") {
    step(
      "Anchor to the wall",
      checks.tipOver.anchoredRequired || spec.anchored
        ? `Fix the unit to the wall structure. Margin without anchoring is ${checks.tipOver.margin}, which is below 1.0. Find studs or use rated hollow-wall anchors, and anchor at the top rail.`
        : "Anchoring is optional by calculation for this geometry, but recommended in any room a child uses.",
      "Tip-over is the leading furniture injury mechanism; the calculation decides whether it is mandatory, not whether it is wise.",
      ["stud finder", "drill", "wall anchor kit"],
    );
  }

  step(
    "Load test and sign off",
    `Load ${spec.kind === "table" ? "the top" : "each shelf"} with ${spec.loadPerShelfKg} kg evenly distributed and measure the centre deflection after 24 hours. Predicted long-term deflection is ${checks.shelfDeflection.longTermMm} mm against a ${checks.shelfDeflection.limitMm} mm limit.`,
    "Measuring closes the loop between the model and the real board, which is the only way the model gets more accurate over time.",
    ["tape measure", "straight edge", "weight reference"],
  );

  return { steps, stepCount: steps.length };
}
