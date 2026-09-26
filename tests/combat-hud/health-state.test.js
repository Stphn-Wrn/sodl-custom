import { test } from "node:test";
import assert from "node:assert/strict";
import { healthState } from "../../src/features/combat-hud/health-state.js";
import { t } from "../helpers/i18n.js";

test("sans aucun dégât, le personnage est indemne", () => {
  const result = healthState({ damage: 0, healthMax: 12 }, t);
  assert.deepEqual(result, { id: "full", label: "Indemne" });
});

test("avec des dégâts sous la moitié de la Santé, le personnage est touché", () => {
  const result = healthState({ damage: 5, healthMax: 12 }, t);
  assert.deepEqual(result, { id: "hurt", label: "Touché" });
});

test("à partir de la moitié de la Santé en dégâts, le personnage est blessé", () => {
  const result = healthState({ damage: 6, healthMax: 12 }, t);
  assert.deepEqual(result, { id: "injured", label: "Blessé" });
});

test("quand les dégâts égalent la Santé, le personnage est neutralisé", () => {
  const result = healthState({ damage: 12, healthMax: 12 }, t);
  assert.deepEqual(result, { id: "incapacitated", label: "Neutralisé" });
});

test("sans Santé renseignée, l'état est inconnu", () => {
  const result = healthState({ damage: 0, healthMax: 0 }, t);
  assert.deepEqual(result, { id: "unknown", label: "Santé non renseignée" });
});
