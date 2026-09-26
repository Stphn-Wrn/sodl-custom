import { test } from "node:test";
import assert from "node:assert/strict";
import { partyRow } from "../../src/features/party-dashboard/party-row.js";
import { t } from "../helpers/i18n.js";

function snapshot(overrides) {
  return {
    name: "Bartoras",
    img: "b.webp",
    fastTurn: false,
    characteristics: { health: 7, healthMax: 12, damage: 5, defense: 14, speed: 10, insanity: 2, insanityMax: 9, corruption: 1 },
    statuses: [],
    ...overrides
  };
}

test("une ligne du tableau reprend l'état de santé et les valeurs utiles au MJ", () => {
  const row = partyRow("a1", snapshot({}), t);
  assert.deepEqual(row, {
    actorId: "a1",
    name: "Bartoras",
    img: "b.webp",
    stateId: "hurt",
    stateLabel: "Touché",
    health: 7,
    healthMax: 12,
    healthPercent: 58,
    defense: 14,
    speed: 10,
    insanity: "2/9",
    corruption: 1,
    turnLabel: "Lent",
    fastTurn: false,
    afflictions: []
  });
});

test("les afflictions actives sont listées par leur nom", () => {
  const row = partyRow("a1", snapshot({ statuses: ["prone", "injured", "frightened"] }), t);
  assert.deepEqual(row.afflictions, ["À terre", "Effrayé"]);
});

test("sans Santé renseignée, la barre est vide", () => {
  const row = partyRow("a1", snapshot({ characteristics: { health: 0, healthMax: 0, damage: 0, defense: 10, speed: 10, insanity: 0, insanityMax: 10, corruption: 0 } }), t);
  assert.equal(row.healthPercent, 0);
  assert.equal(row.stateId, "unknown");
});
