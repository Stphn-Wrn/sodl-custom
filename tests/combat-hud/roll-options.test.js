import { test } from "node:test";
import assert from "node:assert/strict";
import { armRoll, takeArmedRoll, stepRollOption } from "../../src/features/combat-hud/roll-options.js";

test("un jet armé est récupéré par la fenêtre qui s'ouvre juste après", () => {
  const armed = armRoll({ boons: 2, modifier: -1 }, 1000);
  assert.deepEqual(takeArmedRoll(armed, 1500), { boons: 2, modifier: -1 });
});

test("un jet armé expire pour ne pas remplir une fenêtre ouverte bien plus tard", () => {
  const armed = armRoll({ boons: 2, modifier: 0 }, 1000);
  assert.equal(takeArmedRoll(armed, 5000), null);
});

test("sans jet armé, aucune fenêtre n'est remplie", () => {
  assert.equal(takeArmedRoll(null, 1000), null);
});

test("les faveurs et fléaux restent entre -5 et +5", () => {
  assert.equal(stepRollOption("boons", 5, 1), 5);
  assert.equal(stepRollOption("boons", -5, -1), -5);
  assert.equal(stepRollOption("boons", 0, 1), 1);
});

test("le modificateur reste entre -10 et +10", () => {
  assert.equal(stepRollOption("modifier", 10, 1), 10);
  assert.equal(stepRollOption("modifier", -3, -1), -4);
});
