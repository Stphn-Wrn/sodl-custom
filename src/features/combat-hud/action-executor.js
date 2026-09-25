import { escapeHTML, getDialogClass } from "../../shared/foundry-adapter.js";
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

// Une profession accorde une faveur au jet quand elle s'applique : on propose
// le jet d'Intelligence avec +1 faveur, modifiable avant de lancer.
function rollProfession(actor, { itemId }) {
  const profession = actor.items.get(itemId);
  const options = Object.entries(actor.system.attributes)
    .map(([key, attribute]) => {
      let selected = "";
      if (key === "intellect") {
        selected = "selected";
      }
      return `<option value="${key}" ${selected}>${escapeHTML(attribute.label || key)}</option>`;
    })
    .join("");

  const DialogClass = getDialogClass();
  new DialogClass({
    title: `Profession : ${profession?.name ?? ""}`,
    content: `
      <form class="sodl-hud-profession-form">
        <div class="form-group"><label>Caractéristique</label><select name="attribute">${options}</select></div>
        <div class="form-group"><label>Faveurs / fléaux</label><input type="number" name="boons" value="1"></div>
        <div class="form-group"><label>Modificateur</label><input type="number" name="modifier" value="0"></div>
      </form>`,
    buttons: {
      roll: {
        icon: '<i class="fas fa-dice-d20"></i>',
        label: "Lancer",
        callback: (html) => {
          const form = $(html).find("form")[0];
          const attribute = actor.getAttribute(form.attribute.value);
          actor.rollAttributeChallenge(attribute, form.boons.value, form.modifier.value);
        }
      },
      cancel: { icon: '<i class="fas fa-times"></i>', label: "Annuler" }
    },
    default: "roll"
  }).render(true);
}

const ACTION_STRATEGIES = {
  rollWeapon: (actor, action) => actor.rollWeaponAttack(action.itemId),
  castSpell: (actor, action) => actor.rollSpell(action.itemId),
  useTalent: (actor, action) => actor.rollTalent(action.itemId),
  useItem: (actor, action) => actor.rollItem(action.itemId),
  rollChallenge: (actor, action) => actor.rollChallenge(action.attribute),
  rollProfession,
  toggleWear
};

export function executeAction(actor, action) {
  const strategy = ACTION_STRATEGIES[action.type];
  if (!strategy) {
    console.warn(`SODL Companion | Action de HUD inconnue : ${action.type}`);
    return undefined;
  }
  return strategy(actor, action);
}

export function changeDamage(actor, increment) {
  return actor.increaseDamage(increment);
}
