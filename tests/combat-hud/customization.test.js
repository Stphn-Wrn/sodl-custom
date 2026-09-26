import { test } from "node:test";
import assert from "node:assert/strict";
import { arrange, entryKey, moveBefore, pickFavorites, toggle } from "../../src/features/combat-hud/customization.js";

test("les éléments suivent l'ordre choisi, les masqués sont mis à part", () => {
  const result = arrange(["attacks", "spells", "talents", "effects"], { order: ["talents", "attacks"], hidden: ["effects"] });
  assert.deepEqual(result, { visible: ["talents", "attacks", "spells"], hidden: ["effects"] });
});

test("sans préférence, l'ordre par défaut est conservé", () => {
  const result = arrange(["attacks", "spells"], {});
  assert.deepEqual(result, { visible: ["attacks", "spells"], hidden: [] });
});

test("un élément disparu de la liste par défaut est ignoré", () => {
  const result = arrange(["attacks", "spells"], { order: ["equipment", "spells", "attacks"], hidden: ["equipment"] });
  assert.deepEqual(result, { visible: ["spells", "attacks"], hidden: [] });
});

test("glisser un élément sur un autre le place juste avant", () => {
  assert.deepEqual(moveBefore(["a", "b", "c", "d"], "d", "b"), ["a", "d", "b", "c"]);
  assert.deepEqual(moveBefore(["a", "b", "c"], "a", "c"), ["b", "a", "c"]);
});

test("basculer ajoute ou retire un élément d'une liste", () => {
  assert.deepEqual(toggle(["a"], "b"), ["a", "b"]);
  assert.deepEqual(toggle(["a", "b"], "a"), ["b"]);
});

test("une tuile est identifiée par son action, pas par sa position", () => {
  assert.equal(entryKey({ action: { type: "rollWeapon", itemId: "w1", rollOptions: true } }), "rollWeapon:w1");
  assert.equal(entryKey({ action: { type: "rollChallenge", attribute: "strength", rollOptions: true } }), "rollChallenge:strength");
  assert.equal(entryKey({ action: { type: "postRule", ruleRef: "actions:8" } }), "postRule:actions:8");
  assert.equal(entryKey({ action: { type: "spendFortune", useIndex: 5 } }), "spendFortune:5");
});

test("les tuiles de navigation ou sans action ne peuvent pas être épinglées", () => {
  assert.equal(entryKey({ action: { type: "navigate", view: {} } }), null);
  assert.equal(entryKey({ action: null }), null);
  assert.equal(entryKey({ action: { type: "createEffect" } }), null);
});

test("les favoris sont retrouvés dans l'ordre d'épinglage, sans doublon ni disparu", () => {
  const entries = [
    { name: "Arc", action: { type: "rollWeapon", itemId: "w1" } },
    { name: "Force", action: { type: "rollChallenge", attribute: "strength" } },
    { name: "Arc", action: { type: "rollWeapon", itemId: "w1" } }
  ];
  const favorites = pickFavorites(entries, ["rollChallenge:strength", "rollWeapon:w1", "castSpell:gone"]);
  assert.deepEqual(favorites.map((entry) => entry.name), ["Force", "Arc"]);
});
