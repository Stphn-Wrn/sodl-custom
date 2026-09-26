import { test } from "node:test";
import assert from "node:assert/strict";
import { ruleByRef } from "../../src/features/combat-hud/sections.js";
import { t } from "../helpers/i18n.js";

test("une référence d'affliction renvoie son nom sans l'identifiant anglais et sa description", () => {
  const rule = ruleByRef("afflictions:prone", t);
  assert.equal(rule.name, "À terre");
  assert.match(rule.description, /Se relever/);
});

test("une référence d'action pointe sur la position dans la liste", () => {
  assert.equal(ruleByRef("meleeOptions:3", t).name, "Attaque en fente");
});

test("une référence inconnue ne renvoie rien", () => {
  assert.equal(ruleByRef("afflictions:inconnue", t), null);
  assert.equal(ruleByRef("inexistant:0", t), null);
});
