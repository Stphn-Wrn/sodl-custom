import { test } from "node:test";
import assert from "node:assert/strict";
import { createSections } from "../../src/features/combat-hud/sections.js";

function section(actorType, id) {
  return createSections(actorType).find((candidate) => candidate.id === id);
}

function emptySnapshot(overrides) {
  return {
    attributes: [],
    weapons: [],
    armors: [],
    ammo: [],
    spells: [],
    talents: [],
    consumables: [],
    professions: [],
    ...overrides
  };
}

test("un personnage a tous les onglets, une créature n'a pas l'équipement ni les professions", () => {
  const characterIds = createSections("character").map((candidate) => candidate.id);
  const creatureIds = createSections("creature").map((candidate) => candidate.id);
  assert.deepEqual(characterIds, ["attacks", "equipment", "spells", "talents", "items", "attributes"]);
  assert.deepEqual(creatureIds, ["attacks", "spells", "talents", "attributes"]);
});

test("les attaques ne listent que les armes portées", () => {
  const snapshot = emptySnapshot({
    weapons: [
      { id: "sword", name: "Épée", worn: true, ammo: { required: false } },
      { id: "bow", name: "Arc", worn: false, ammo: { required: false } }
    ]
  });
  const names = section("character", "attacks").build(snapshot).map((entry) => entry.name);
  assert.deepEqual(names, ["Épée"]);
});

test("une arme à munitions affiche le stock et se désactive quand il est vide", () => {
  const snapshot = emptySnapshot({
    weapons: [{ id: "bow", name: "Arc", worn: true, ammo: { required: true, itemId: "arrows", amount: 1 } }],
    ammo: [{ id: "arrows", name: "Flèches", quantity: 0 }]
  });
  const [entry] = section("character", "attacks").build(snapshot);
  assert.equal(entry.badge, "0");
  assert.equal(entry.disabled, true);
});

test("une arme à munitions sans munition liée est désactivée", () => {
  const snapshot = emptySnapshot({
    weapons: [{ id: "bow", name: "Arc", worn: true, ammo: { required: true, itemId: "", amount: 1 } }]
  });
  const [entry] = section("character", "attacks").build(snapshot);
  assert.equal(entry.disabled, true);
  assert.equal(entry.warning, "Aucune munition associée");
});

test("l'équipement signale un prérequis de caractéristique non rempli", () => {
  const snapshot = emptySnapshot({
    attributes: [{ key: "strength", label: "Force", value: 10 }],
    weapons: [{ id: "xbow", name: "Arbalète lourde", worn: false, hands: "two", requirement: { attribute: "strength", min: 12 }, ammo: { required: false } }]
  });
  const [entry] = section("character", "equipment").build(snapshot);
  assert.equal(entry.warning, "Requiert Force 12 : 1 fléau");
  assert.deepEqual(entry.action, { type: "toggleWear", itemId: "xbow" });
});

test("les sorts sont triés par rang et affichent les incantations restantes", () => {
  const snapshot = emptySnapshot({
    spells: [
      { id: "s2", name: "Boule de feu", rank: 2, used: 0, max: 1 },
      { id: "s0", name: "Flamme", rank: 0, used: 1, max: 3 }
    ]
  });
  const entries = section("character", "spells").build(snapshot);
  assert.deepEqual(
    entries.map((entry) => [entry.name, entry.badge, entry.disabled]),
    [["Flamme", "2/3", false], ["Boule de feu", "1/1", false]]
  );
});

test("un sort sans incantation restante est désactivé", () => {
  const snapshot = emptySnapshot({ spells: [{ id: "s1", name: "Éclair", rank: 1, used: 2, max: 2 }] });
  const [entry] = section("character", "spells").build(snapshot);
  assert.equal(entry.badge, "0/2");
  assert.equal(entry.disabled, true);
});

test("un talent sans limite d'utilisation n'affiche pas de compteur", () => {
  const snapshot = emptySnapshot({ talents: [{ id: "t1", name: "Riposte", used: 0, max: 0 }] });
  const [entry] = section("character", "talents").build(snapshot);
  assert.equal(entry.badge, "");
  assert.equal(entry.disabled, false);
});

test("un consommable épuisé est désactivé", () => {
  const snapshot = emptySnapshot({ consumables: [{ id: "p1", name: "Potion", quantity: 0 }] });
  const [entry] = section("character", "items").build(snapshot);
  assert.equal(entry.badge, "×0");
  assert.equal(entry.disabled, true);
});

test("l'onglet caractéristiques propose les jets d'attribut puis les professions", () => {
  const snapshot = emptySnapshot({
    attributes: [{ key: "agility", label: "Agilité", value: 12, modifier: 2 }],
    professions: [{ id: "p1", name: "Forgeron" }]
  });
  const entries = section("character", "attributes").build(snapshot);
  assert.deepEqual(
    entries.map((entry) => [entry.name, entry.badge, entry.action]),
    [
      ["Agilité", "12 (+2)", { type: "rollChallenge", attribute: "agility" }],
      ["Forgeron", "Profession", { type: "rollProfession", itemId: "p1" }]
    ]
  );
});
