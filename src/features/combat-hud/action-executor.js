import { escapeHTML, t } from "../../shared/foundry-adapter.js";
import { limitedUsesOf, toEquipmentItems, toSnapshot, toUsesUpdate, toWearUpdates } from "./actor-adapter.js";
import { adjustUsed } from "./uses.js";
import { planEquip, planUnequip } from "./equipment-rules.js";
import { afflictionCatalogue, afflictionName } from "./sections.js";

async function toggleWear(actor, { itemId }) {
  const equipmentItems = toEquipmentItems(toSnapshot(actor));
  const target = equipmentItems.find((item) => item.id === itemId);
  let changes = [];
  if (target?.worn) {
    changes = planUnequip(equipmentItems, itemId);
  } else {
    changes = planEquip(equipmentItems, itemId);
  }
  if (changes.length === 0) {
    return;
  }

  await actor.updateEmbeddedDocuments("Item", toWearUpdates(changes));
  const stowed = changes
    .filter((change) => !change.worn && change.id !== itemId)
    .map((change) => actor.items.get(change.id)?.name);
  if (stowed.length > 0) {
    ui.notifications.info(t("SODL.Hud.Notify.Stowed", { items: stowed.join(", ") }));
  }
}

function rollProfession(actor, { attribute }) {
  return actor.rollChallenge(attribute);
}

function rollDice(actor, { amount, faces }) {
  const formula = `${amount}d${faces}`;
  return new Roll(formula).toMessage({
    speaker: ChatMessage.getSpeaker({ actor }),
    flavor: t("SODL.Hud.Chat.DiceRoll", { formula })
  });
}

async function recover(actor) {
  const { healingRate } = toSnapshot(actor).characteristics;
  await actor.applyHealing(true);
  return ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    content: `<p>${t("SODL.Hud.Chat.Recover", { name: escapeHTML(actor.name), amount: healingRate })}</p>`
  });
}

async function toggleStatus(actor, { statusId }) {
  const existing = actor.effects.find((effect) => effect.statuses?.has(statusId));
  if (existing) {
    return existing.delete();
  }
  if (actor.isImmuneToAffliction?.(statusId)) {
    ui.notifications.warn(t("SODL.Hud.Notify.Immune", { name: actor.name }));
    return undefined;
  }
  const definition = CONFIG.statusEffects[statusId];
  if (!definition) {
    ui.notifications.error(t("SODL.Hud.Notify.UnknownAffliction", { id: statusId }));
    return undefined;
  }
  const data = { ...foundry.utils.deepClone(definition), statuses: [statusId] };
  return ActiveEffect.create(data, { parent: actor });
}

function toggleEffect(actor, { effectId }) {
  const effect = actor.effects.get(effectId);
  return effect?.update({ disabled: !effect.disabled });
}

async function createEffect(actor) {
  const [effect] = await actor.createEmbeddedDocuments("ActiveEffect", [{ name: t("SODL.Hud.NewEffect"), img: "icons/svg/aura.svg" }]);
  effect?.sheet.render(true);
  return effect;
}

function deleteEffect(actor, { effectId }) {
  return actor.effects.get(effectId)?.delete();
}

function adjustUses(actor, { itemId, amount }) {
  const uses = limitedUsesOf(toSnapshot(actor), itemId);
  const item = actor.items.get(itemId);
  if (!uses || !item) {
    return undefined;
  }
  const used = adjustUsed(uses, amount);
  if (used === uses.used) {
    return undefined;
  }
  return item.update(toUsesUpdate(item.type, used));
}

function postRule(actor, { ruleId }) {
  const affliction = afflictionCatalogue(t).find((candidate) => candidate.id === ruleId);
  if (!affliction) {
    return undefined;
  }
  return ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    content: `<h3>${escapeHTML(afflictionName(affliction))}</h3><p>${escapeHTML(affliction.description)}</p>`
  });
}

function rest(actor, action) {
  return actor.restActor(action.amount, true, true, true);
}

const ACTION_STRATEGIES = {
  rollWeapon: (actor, action) => actor.rollWeaponAttack(action.itemId),
  castSpell: (actor, action) => actor.rollSpell(action.itemId),
  useTalent: (actor, action) => actor.rollTalent(action.itemId),
  useItem: (actor, action) => actor.rollItem(action.itemId),
  rollChallenge: (actor, action) => actor.rollChallenge(action.attribute),
  rollProfession,
  toggleWear,
  changeDamage: (actor, action) => actor.increaseDamage(action.amount),
  changeInsanity: (actor, action) => actor.increaseInsanity(action.amount),
  changeCorruption: (actor, action) => actor.increaseCorruption(action.amount),
  rollCorruption: (actor) => actor.rollCorruption(),
  rollDice,
  toggleStatus,
  toggleEffect,
  createEffect,
  deleteEffect,
  postRule,
  adjustUses,
  recover,
  rest
};

export function executeAction(actor, action) {
  const strategy = ACTION_STRATEGIES[action.type];
  if (!strategy) {
    console.warn(`SODL Companion | Unknown HUD action: ${action.type}`);
    return undefined;
  }
  return strategy(actor, action);
}
