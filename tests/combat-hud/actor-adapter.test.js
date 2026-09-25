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
      health: { value: 7, max: 20, injured: true },
      insanity: { value: 2, max: 10 },
      corruption: { value: 1 }
    }
  });
  const expected = { health: 13, healthMax: 20, damage: 7, injured: true, defense: 14, speed: 10, power: 1, insanity: 2, insanityMax: 10, corruption: 1 };
  assert.deepEqual(toSnapshot(actor).characteristics, expected);
});

test("les incantations et utilisations stockées en texte sont converties en nombres", () => {
  const actor = actorWith([
    { id: "s1", type: "spell", name: "Éclair", img: "", system: { rank: 1, castings: { value: "1", max: "3" } } },
    { id: "t1", type: "talent", name: "Riposte", img: "", system: { uses: { value: "", max: "" } } }
  ]);
  const snapshot = toSnapshot(actor);
  assert.deepEqual(snapshot.spells[0], { id: "s1", name: "Éclair", img: "", rank: 1, used: 1, max: 3 });
  assert.deepEqual(snapshot.talents[0], { id: "t1", name: "Riposte", img: "", used: 0, max: 0 });
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
