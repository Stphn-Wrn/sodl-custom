import { afflictionCatalogue, afflictionName } from "../combat-hud/sections.js";

function namesOf(effects) {
  return effects.map((effect) => effect.name).join(", ");
}

export function buildRoundReminders(combatants, t) {
  const catalogue = afflictionCatalogue(t);
  return combatants
    .map((combatant) => {
      const notes = [];
      const { damage, healthMax } = combatant.characteristics;
      if (healthMax > 0 && damage >= healthMax) {
        notes.push(t("SODL.Reminders.FateRoll"));
      }

      const afflictions = catalogue.filter((affliction) => combatant.statuses.includes(affliction.id));
      if (afflictions.length > 0) {
        notes.push(t("SODL.Reminders.Afflictions", { list: afflictions.map(afflictionName).join(", ") }));
      }

      const timed = combatant.effects.filter((effect) => effect.remainingRounds !== null);
      const expired = timed.filter((effect) => effect.remainingRounds <= 0);
      const ending = timed.filter((effect) => effect.remainingRounds === 1);
      if (expired.length > 0) {
        notes.push(t("SODL.Reminders.Expired", { list: namesOf(expired) }));
      }
      if (ending.length > 0) {
        notes.push(t("SODL.Reminders.Ending", { list: namesOf(ending) }));
      }

      return { name: combatant.name, notes };
    })
    .filter((reminder) => reminder.notes.length > 0);
}
