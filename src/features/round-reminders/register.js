import { MODULE_ID } from "../../shared/constants.js";
import { escapeHTML, t } from "../../shared/foundry-adapter.js";
import { toSnapshot } from "../combat-hud/actor-adapter.js";
import { buildRoundReminders } from "./reminders.js";

function isEnabled() {
  return game.settings.get(MODULE_ID, "roundRemindersEnabled");
}

function isResponsibleGm() {
  return game.users.activeGM?.id === game.user.id;
}

function reminderContent(round, reminders) {
  const items = reminders
    .map((reminder) => `<li><strong>${escapeHTML(reminder.name)}</strong> : ${reminder.notes.map(escapeHTML).join(" · ")}</li>`)
    .join("");
  return `<h3>${t("SODL.Reminders.Title", { round })}</h3><ul>${items}</ul>`;
}

async function onRoundChanged(combat, changed) {
  if (!("round" in changed) || !isEnabled() || !isResponsibleGm()) {
    return;
  }
  const combatants = combat.combatants
    .filter((combatant) => combatant.actor)
    .map((combatant) => ({ ...toSnapshot(combatant.actor), name: combatant.name }));
  const reminders = buildRoundReminders(combatants, t);
  if (reminders.length === 0) {
    return;
  }
  await ChatMessage.create({
    content: reminderContent(combat.round, reminders),
    whisper: ChatMessage.getWhisperRecipients("GM")
  });
}

export const roundRemindersFeature = {
  init() {
    game.settings.register(MODULE_ID, "roundRemindersEnabled", {
      name: "SODL.Settings.RoundRemindersEnabled.Name",
      hint: "SODL.Settings.RoundRemindersEnabled.Hint",
      scope: "world",
      config: true,
      type: Boolean,
      default: true
    });
  },

  ready() {
    Hooks.on("updateCombat", onRoundChanged);
  }
};
