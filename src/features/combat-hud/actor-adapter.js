import { MODULE_ID } from "../../shared/constants.js";

export const PORTRAIT_FRAME_FLAG = "portraitFrame";

function toNumber(value) {
  return parseInt(value, 10) || 0;
}

function itemsOfType(actor, type) {
  return Array.from(actor.items).filter((item) => item.type === type);
}

function base(item) {
  return { id: item.id, name: item.name, img: item.img };
}

function requirement(system) {
  return { attribute: system.requirement?.attribute ?? "", min: toNumber(system.requirement?.minvalue) };
}

function rollsAttack(system) {
  return Boolean(system.action?.attack);
}

function remainingRounds(effect) {
  if (effect.duration?.type !== "turns" || typeof effect.duration.remaining !== "number") {
    return null;
  }
  return effect.duration.remaining;
}

function characteristics(system) {
  const values = system.characteristics;
  const damage = toNumber(values.health?.value);
  const healthMax = toNumber(values.health?.max);
  return {
    health: healthMax - damage,
    healthMax,
    damage,
    injured: Boolean(values.health?.injured),
    healingRate: toNumber(values.health?.healingrate),
    defense: toNumber(values.defense),
    speed: toNumber(values.speed),
    power: toNumber(values.power),
    insanity: toNumber(values.insanity?.value),
    insanityMax: toNumber(values.insanity?.max),
    corruption: toNumber(values.corruption?.value)
  };
}

function attributes(system) {
  return Object.entries(system.attributes ?? {}).map(([key, attribute]) => ({
    key,
    label: attribute.label || key,
    value: toNumber(attribute.value),
    modifier: toNumber(attribute.modifier)
  }));
}

export function toSnapshot(actor) {
  const system = actor.system;
  return {
    name: actor.name,
    img: actor.img,
    portraitFrame: actor.flags?.[MODULE_ID]?.[PORTRAIT_FRAME_FLAG] ?? null,
    type: actor.type,
    characteristics: characteristics(system),
    fastTurn: Boolean(system.fastturn),
    attributes: attributes(system),
    weapons: itemsOfType(actor, "weapon").map((item) => ({
      ...base(item),
      hands: item.system.hands ?? "",
      worn: Boolean(item.system.wear),
      requirement: requirement(item.system),
      ammo: {
        required: Boolean(item.system.consume?.ammorequired),
        itemId: item.system.consume?.ammoitemid ?? "",
        amount: toNumber(item.system.consume?.amount)
      }
    })),
    armors: itemsOfType(actor, "armor").map((item) => ({
      ...base(item),
      isShield: Boolean(item.system.isShield),
      worn: Boolean(item.system.wear),
      requirement: requirement(item.system)
    })),
    ammo: itemsOfType(actor, "ammo").map((item) => ({ ...base(item), quantity: toNumber(item.system.quantity) })),
    spells: itemsOfType(actor, "spell").map((item) => ({
      ...base(item),
      tradition: item.system.tradition ?? "",
      rank: toNumber(item.system.rank),
      used: toNumber(item.system.castings?.value),
      max: toNumber(item.system.castings?.max),
      rollsAttack: item.system.spelltype === "Attack" && rollsAttack(item.system)
    })),
    talents: itemsOfType(actor, "talent").map((item) => ({
      ...base(item),
      used: toNumber(item.system.uses?.value),
      max: toNumber(item.system.uses?.max),
      rollsAttack: rollsAttack(item.system)
    })),
    consumables: itemsOfType(actor, "item")
      .filter((item) => item.system.consumabletype)
      .map((item) => ({ ...base(item), quantity: toNumber(item.system.quantity), rollsAttack: rollsAttack(item.system) })),
    professions: itemsOfType(actor, "profession").map(base),

    statuses: Array.from(actor.statuses ?? []),
    effects: Array.from(actor.effects ?? []).map((effect) => ({
      id: effect.id,
      name: effect.name,
      img: effect.img ?? effect.icon ?? "",
      disabled: Boolean(effect.disabled),
      statuses: Array.from(effect.statuses ?? []),
      duration: effect.duration?.label ?? "",
      remainingRounds: remainingRounds(effect)
    }))
  };
}

export function toEquipmentItems(snapshot) {
  return [
    ...snapshot.weapons.map((weapon) => ({ id: weapon.id, type: "weapon", hands: weapon.hands, isShield: false, worn: weapon.worn })),
    ...snapshot.armors.map((armor) => ({ id: armor.id, type: "armor", hands: undefined, isShield: armor.isShield, worn: armor.worn }))
  ];
}

export function toWearUpdates(changes) {
  return changes.map((change) => ({ _id: change.id, "system.wear": change.worn }));
}

const USES_PATH = { spell: "system.castings.value", talent: "system.uses.value" };

export function limitedUsesOf(snapshot, itemId) {
  return [...snapshot.spells, ...snapshot.talents].find((item) => item.id === itemId) ?? null;
}

export function toUsesUpdate(itemType, used) {
  return { [USES_PATH[itemType]]: String(used) };
}
