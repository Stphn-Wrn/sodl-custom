import { test } from "node:test";
import assert from "node:assert/strict";
import { computeAnchors, resizeHeight } from "../../src/features/combat-hud/layout.js";

test("tirer la poignée vers le haut agrandit la zone des actions", () => {
  assert.equal(resizeHeight(84, -40), 124);
});

test("la hauteur de la zone des actions reste entre le minimum et le maximum", () => {
  assert.equal(resizeHeight(84, 500), 36);
  assert.equal(resizeHeight(84, -2000), 480);
});

test("le HUD s'étend du bord de l'interface de gauche jusqu'à la barre latérale", () => {
  const result = computeAnchors({ uiLeftX: 16, sidebarX: 1600, viewportWidth: 1920 });
  assert.deepEqual(result, { left: 16, right: 328 });
});

test("sans interface détectée, le HUD garde une marge de chaque côté", () => {
  const result = computeAnchors({ uiLeftX: null, sidebarX: null, viewportWidth: 1920 });
  assert.deepEqual(result, { left: 16, right: 16 });
});
