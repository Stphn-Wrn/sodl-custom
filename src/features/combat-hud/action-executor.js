import { escapeHTML } from "../../shared/foundry-adapter.js";
import { SODL_CONFIG } from "../companion/config.js";
import { limitedUsesOf, toEquipmentItems, toSnapshot, toUsesUpdate, toWearUpdates } from "./actor-adapter.js";
import { adjustUsed } from "./uses.js";
import { planEquip, planUnequip } from "./equipment-rules.js";
import { afflictionName } from "./sections.js";

/**
 * Exécute les actions du HUD en déléguant au système `demonlord` : jets,
 * dialogues de faveurs/fléaux, consommation de munitions et d'utilisations
 * restent gérés par le système. Une stratégie par type d'action.
 */

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
    ui.notifications.info(`Rangé : ${stowed.join(", ")}`);
  }
}

// Défi sur la caractéristique choisie pour la profession.
function rollProfession(actor, { attribute }) {
  return actor.rollChallenge(attribute);
}

// Jet libre de `amount` dés à `faces` faces (ex. 3d6), posté au nom du personnage.
function rollDice(actor, { amount, faces }) {
  const formula = `${amount}d${faces}`;
  return new Roll(formula).toMessage({ speaker: ChatMessage.getSpeaker({ actor }), flavor: `Jet de ${formula}` });
}

// Action Récupérer : soigne le taux de guérison (règle : une fois par repos,
// non vérifiée par le système). Le système ne poste rien, on l'annonce au chat.
async function recover(actor) {
  const { healingRate } = toSnapshot(actor).characteristics;
  await actor.applyHealing(true);
  return ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    content: `<p><strong>${escapeHTML(actor.name)}</strong> récupère et soigne ${healingRate} dégât(s).</p>`
  });
}

// Rend (+1) ou retire (-1) une utilisation d'un sort ou d'un talent, sans le lancer.
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

// Poste dans le chat la règle d'une affliction (aide de jeu du compagnon).
function postRule(actor, { ruleId }) {
  const affliction = SODL_CONFIG.afflictions.list.find((candidate) => candidate.id === ruleId);
  if (!affliction) {
    return undefined;
  }
  return ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    content: `<h3>${escapeHTML(afflictionName(affliction))}</h3><p>${escapeHTML(affliction.description)}</p>`
  });
}

// Repos de 8 ou 24 h du système : rend talents et incantations et soigne.
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
  toggleStatus: (actor, action) => actor.toggleStatusEffect(action.statusId),
  postRule,
  adjustUses,
  recover,
  rest
};

export function executeAction(actor, action) {
  const strategy = ACTION_STRATEGIES[action.type];
  if (!strategy) {
    console.warn(`SODL Companion | Action de HUD inconnue : ${action.type}`);
    return undefined;
  }
  return strategy(actor, action);
}
