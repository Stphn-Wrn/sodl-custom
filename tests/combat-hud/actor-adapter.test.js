import { test } from "node:test";
import assert from "node:assert/strict";
import { toSnapshot, toEquipmentItems } from "../../src/features/combat-hud/actor-adapter.js";

function actorWith(items, systemOverrides = {}) {
  return {
    name: "Aldric",
    img: "aldric.webp",
    type: "character",
    system: {
      attributes: {},
      characteristics: { health: { value: 0, max: 0 }, insanity: {}, corruption: {} },
      ...systemOverrides
    },
    items
  };
}

test("la santé affichée est le maximum moins les dégâts subis", () => {
  const actor = actorWith([], {
    characteristics: {
      defense: 14, speed: 10, power: 1,
      health: { value: 7, max: 20, injured: true, healingrate: 5 },
      insanity: { value: 2, max: 10 },
      corruption: { value: 1 }
    }
  });
  const expected = { health: 13, healthMax: 20, damage: 7, injured: true, healingRate: 5, defense: 14, speed: 10, power: 1, insanity: 2, insanityMax: 10, corruption: 1 };
  assert.deepEqual(toSnapshot(actor).characteristics, expected);
});

test("les incantations et utilisations stockées en texte sont converties en nombres", () => {
  const actor = actorWith([
    { id: "s1", type: "spell", name: "Éclair", img: "", system: { rank: 1, tradition: "Tempête", spelltype: "Attack", action: { attack: "Will" }, castings: { value: "1", max: "3" } } },
    { id: "t1", type: "talent", name: "Riposte", img: "", system: { uses: { value: "", max: "" } } }
  ]);
  const snapshot = toSnapshot(actor);
  assert.deepEqual(snapshot.spells[0], { id: "s1", name: "Éclair", img: "", tradition: "Tempête", rank: 1, used: 1, max: 3, rollsAttack: true });
  assert.deepEqual(snapshot.talents[0], { id: "t1", name: "Riposte", img: "", used: 0, max: 0, rollsAttack: false });
});

test("seuls les objets consommables apparaissent dans les objets utilisables", () => {
  const actor = actorWith([
    { id: "p1", type: "item", name: "Potion", img: "", system: { consumabletype: "P", quantity: 2 } },
    { id: "r1", type: "item", name: "Corde", img: "", system: { consumabletype: "", quantity: 1 } }
  ]);
  const names = toSnapshot(actor).consumables.map((item) => item.name);
  assert.deepEqual(names, ["Potion"]);
});

test("les objets d'équipement sont convertis pour les règles d'équipement", () => {
  const actor = actorWith([
    { id: "w1", type: "weapon", name: "Épée", img: "", system: { hands: "one", wear: true, consume: {}, requirement: {} } },
    { id: "a1", type: "armor", name: "Écu", img: "", system: { isShield: true, wear: false, requirement: {} } },
    { id: "s1", type: "spell", name: "Éclair", img: "", system: { castings: {} } }
  ]);
  const expected = [
    { id: "w1", type: "weapon", hands: "one", isShield: false, worn: true },
    { id: "a1", type: "armor", hands: undefined, isShield: true, worn: false }
  ];
  assert.deepEqual(toEquipmentItems(toSnapshot(actor)), expected);
});

test("le cadrage du portrait est lu depuis les flags du module", () => {
  const actor = { ...actorWith([]), flags: { "sodl-companion": { portraitFrame: { x: 40, y: 20, zoom: 1.5 } } } };
  assert.deepEqual(toSnapshot(actor).portraitFrame, { x: 40, y: 20, zoom: 1.5 });
  assert.equal(toSnapshot(actorWith([])).portraitFrame, null);
});

test("les afflictions actives sont lues depuis les statuts de l'acteur", () => {
  const actor = { ...actorWith([]), statuses: new Set(["prone", "blinded"]) };
  assert.deepEqual(toSnapshot(actor).statuses, ["prone", "blinded"]);
});

test("les effets de l'acteur sont lus avec leur état et leur durée restante", () => {
  const effect = { id: "e1", name: "Bénédiction", img: "b.webp", disabled: false, statuses: new Set(), duration: { label: "3 rounds" } };
  const actor = { ...actorWith([]), effects: [effect] };
  assert.deepEqual(toSnapshot(actor).effects, [
    { id: "e1", name: "Bénédiction", img: "b.webp", disabled: false, statuses: [], duration: "3 rounds", remainingRounds: null }
  ]);
});

test("le type de tour choisi (rapide ou lent) est lu depuis l'acteur", () => {
  assert.equal(toSnapshot(actorWith([], { fastturn: true })).fastTurn, true);
  assert.equal(toSnapshot(actorWith([])).fastTurn, false);
});

test("l'ascendance et les voies par palier sont lues depuis les objets", () => {
  const actor = actorWith([
    { id: "an", type: "ancestry", name: "Orc", img: "", system: {} },
    { id: "p1", type: "path", name: "Guerrier", img: "", system: { type: "novice" } },
    { id: "p2", type: "path", name: "Berserker", img: "", system: { type: "expert" } }
  ]);
  const snapshot = toSnapshot(actor);
  assert.deepEqual(snapshot.ancestries, ["Orc"]);
  assert.deepEqual(snapshot.paths, { novice: ["Guerrier"], expert: ["Berserker"], master: [], legendary: [] });
});
