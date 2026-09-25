/**
 * Adapter vers les acteurs du système `demonlord`. C'est le seul fichier qui
 * connaît la forme de `actor.system` et des objets : le reste du HUD travaille
 * sur la vue normalisée renvoyée par `toSnapshot`. Si le système change de
 * structure, seul ce fichier est à adapter.
 */

// Les compteurs d'utilisation sont stockés en texte par le système ("", "2"...).
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

function characteristics(system) {
  const values = system.characteristics;
  const damage = toNumber(values.health?.value);
  const healthMax = toNumber(values.health?.max);
  return {
    health: healthMax - damage,
    healthMax,
    damage,
    injured: Boolean(values.health?.injured),
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
    type: actor.type,
    characteristics: characteristics(system),
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
      max: toNumber(item.system.castings?.max)
    })),
    talents: itemsOfType(actor, "talent").map((item) => ({
      ...base(item),
      used: toNumber(item.system.uses?.value),
      max: toNumber(item.system.uses?.max)
    })),
    consumables: itemsOfType(actor, "item")
      .filter((item) => item.system.consumabletype)
      .map((item) => ({ ...base(item), quantity: toNumber(item.system.quantity) })),
    professions: itemsOfType(actor, "profession").map(base)
  };
}

// Armes et armures sous la forme attendue par equipment-rules.js.
export function toEquipmentItems(snapshot) {
  return [
    ...snapshot.weapons.map((weapon) => ({ id: weapon.id, type: "weapon", hands: weapon.hands, isShield: false, worn: weapon.worn })),
    ...snapshot.armors.map((armor) => ({ id: armor.id, type: "armor", hands: undefined, isShield: armor.isShield, worn: armor.worn }))
  ];
}

export function toWearUpdates(changes) {
  return changes.map((change) => ({ _id: change.id, "system.wear": change.worn }));
}
