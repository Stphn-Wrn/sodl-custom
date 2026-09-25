import { test } from "node:test";
import assert from "node:assert/strict";
import { framePortraitStyle, panFrame, zoomFrame } from "../../src/features/combat-hud/portrait-frame.js";

test("glisser l'image vers la droite montre davantage sa partie gauche", () => {
  const frame = { x: 50, y: 50, zoom: 1 };
  const result = panFrame(frame, { dx: 22, dy: 0 }, 88);
  assert.deepEqual(result, { x: 25, y: 50, zoom: 1 });
});

test("plus l'image est zoomée, plus un même glisser la déplace finement", () => {
  const frame = { x: 50, y: 50, zoom: 2 };
  const result = panFrame(frame, { dx: 0, dy: -22 }, 88);
  assert.deepEqual(result, { x: 50, y: 62.5, zoom: 2 });
});

test("le cadrage ne sort jamais des bords de l'image", () => {
  const frame = { x: 10, y: 90, zoom: 1 };
  const result = panFrame(frame, { dx: 500, dy: -500 }, 88);
  assert.deepEqual(result, { x: 0, y: 100, zoom: 1 });
});

test("la molette vers le haut zoome, vers le bas dézoome, entre x1 et x4", () => {
  const frame = { x: 50, y: 50, zoom: 1 };
  assert.equal(zoomFrame(frame, -100).zoom, 1.1);
  assert.equal(zoomFrame({ ...frame, zoom: 1.05 }, 100).zoom, 1);
  assert.equal(zoomFrame({ ...frame, zoom: 3.9 }, -1000).zoom, 4);
});

test("sans cadrage enregistré, l'image est affichée entière", () => {
  assert.equal(framePortraitStyle(null), "");
});

test("un cadrage enregistré recadre et zoome l'image autour du point choisi", () => {
  const frame = { x: 30, y: 10, zoom: 1.5 };
  const expected = "object-fit: cover; object-position: 30% 10%; transform: scale(1.5); transform-origin: 30% 10%;";
  assert.equal(framePortraitStyle(frame), expected);
});
