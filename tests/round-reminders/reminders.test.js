import { test } from "node:test";
import assert from "node:assert/strict";
import { buildRoundReminders } from "../../src/features/round-reminders/reminders.js";
import { t } from "../helpers/i18n.js";

function combatant(overrides) {
  return {
    name: "Bartoras",
    characteristics: { damage: 0, healthMax: 12 },
    statuses: [],
    effects: [],
    ...overrides
  };
}

test("un combattant sans rien à signaler n'apparaît pas", () => {
  assert.deepEqual(buildRoundReminders([combatant({})], t), []);
});

test("un combattant neutralisé doit faire son jet de destinée", () => {
  const result = buildRoundReminders([combatant({ characteristics: { damage: 12, healthMax: 12 } })], t);
  assert.deepEqual(result, [{ name: "Bartoras", notes: ["Jet de destinée (1d6)"] }]);
});

test("les afflictions actives et les effets qui expirent sont listés", () => {
  const result = buildRoundReminders([
    combatant({
      statuses: ["prone", "injured"],
      effects: [
        { name: "Bénédiction", statuses: [], remainingRounds: 0 },
        { name: "Rage", statuses: [], remainingRounds: 1 },
        { name: "Garde", statuses: [], remainingRounds: 3 },
        { name: "Sans durée", statuses: [], remainingRounds: null }
      ]
    })
  ], t);
  assert.deepEqual(result, [{
    name: "Bartoras",
    notes: ["Afflictions : À terre", "Expiré : Bénédiction", "Expire ce round : Rage"]
  }]);
});
