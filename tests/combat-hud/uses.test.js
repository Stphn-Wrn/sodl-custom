import { test } from "node:test";
import assert from "node:assert/strict";
import { adjustUsed } from "../../src/features/combat-hud/uses.js";

test("rendre une incantation diminue le nombre d'incantations utilisées", () => {
  assert.equal(adjustUsed({ used: 2, max: 3 }, 1), 1);
});

test("retirer une incantation augmente le nombre d'incantations utilisées", () => {
  assert.equal(adjustUsed({ used: 1, max: 3 }, -1), 2);
});

test("les incantations restantes restent entre 0 et le maximum", () => {
  assert.equal(adjustUsed({ used: 0, max: 3 }, 1), 0);
  assert.equal(adjustUsed({ used: 3, max: 3 }, -1), 3);
});
