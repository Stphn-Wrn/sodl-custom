import { test } from "node:test";
import assert from "node:assert/strict";
import { groupByHeading } from "../../src/features/combat-hud/grouping.js";

test("chaque intitulé regroupe les entrées qui le suivent, avec leur position d'origine", () => {
  const entries = [
    { name: "Armes", isHeading: true },
    { name: "Arc" },
    { name: "Épée" },
    { name: "Munitions", isHeading: true },
    { name: "Flèches" }
  ];
  const expected = [
    { label: "Armes", items: [{ name: "Arc", index: 1 }, { name: "Épée", index: 2 }] },
    { label: "Munitions", items: [{ name: "Flèches", index: 4 }] }
  ];
  assert.deepEqual(groupByHeading(entries), expected);
});

test("des entrées sans intitulé forment un seul groupe sans libellé", () => {
  const entries = [{ name: "Force" }, { name: "Agilité" }];
  const expected = [{ label: "", items: [{ name: "Force", index: 0 }, { name: "Agilité", index: 1 }] }];
  assert.deepEqual(groupByHeading(entries), expected);
});
