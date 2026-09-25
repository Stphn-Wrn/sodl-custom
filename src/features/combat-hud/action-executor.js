import { escapeHTML } from "../../shared/foundry-adapter.js";
import { toEquipmentItems, toSnapshot, toWearUpdates } from "./actor-adapter.js";
import { planEquip, planUnequip } from "./equipment-rules.js";

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

// Actions qui ouvrent la fenêtre de faveurs/fléaux du système, que le HUD
// remplit et valide à la place du joueur.
const SYSTEM_ROLL_ACTIONS = ["rollWeapon", "castSpell", "useTalent", "useItem", "rollChallenge", "rollProfession"];

export function isSystemRoll(action) {
  return SYSTEM_ROLL_ACTIONS.includes(action.type);
}
