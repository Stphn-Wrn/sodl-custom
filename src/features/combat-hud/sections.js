import { SODL_CONFIG } from "../companion/config.js";

/**
 * Onglets du HUD de combat (stratégies). Chaque onglet sait construire ses
 * entrées à partir de la vue normalisée de l'acteur (cf. actor-adapter.js) ;
 * il ne touche jamais à Foundry. Une entrée décrit ce qu'on affiche et l'action
 * déclenchée au clic, exécutée ensuite par l'adapter.
 *
 * Entrée : { id, name, img, icon, badge, description, variant, disabled, active, warning, action }
 * Une action `navigate` ne touche pas l'acteur : elle remplace la vue de
 * l'onglet (`view`, passée en second argument de `build`), gérée par le HUD.
 */

function entry(fields) {
  return { img: "", icon: "", badge: "", description: "", variant: "", disabled: false, active: false, warning: "", ...fields };
}

// Tuile de retour à la vue principale de l'onglet (annule sans rien lancer).
function backEntry(label) {
  return entry({
    id: "back",
    name: label,
    icon: "fas fa-arrow-left",
    badge: "Retour",
    variant: "back",
    action: { type: "navigate", view: {} }
  });
}

function formatModifier(modifier) {
  if (modifier > 0) {
    return `+${modifier}`;
  }
  return `${modifier}`;
}

function attributeBadge(attribute) {
  return `${attribute.value} (${formatModifier(attribute.modifier ?? 0)})`;
}

function limitedUses(used, max) {
  if (max <= 0) {
    return { badge: "", exhausted: false };
  }
  const remaining = Math.max(0, max - used);
  return { badge: `${remaining}/${max}`, exhausted: remaining === 0 };
}

function requirementWarning(item, attributes) {
  const requirement = item.requirement;
  if (!requirement?.attribute || !requirement.min) {
    return "";
  }
  const attribute = attributes.find((candidate) => candidate.key === requirement.attribute);
  if (!attribute || attribute.value >= requirement.min) {
    return "";
  }
  return `Requiert ${attribute.label} ${requirement.min} : 1 fléau`;
}

function ammoStatus(weapon, ammo) {
  if (!weapon.ammo?.required) {
    return { badge: "", disabled: false, warning: "" };
  }
  const stock = ammo.find((candidate) => candidate.id === weapon.ammo.itemId);
  if (!stock) {
    return { badge: "", disabled: true, warning: "Aucune munition associée" };
  }
  const amount = weapon.ammo.amount || 1;
  if (stock.quantity < amount) {
    return { badge: `${stock.quantity}`, disabled: true, warning: `Plus de ${stock.name}` };
  }
  return { badge: `${stock.quantity}`, disabled: false, warning: "" };
}

const attacksSection = {
  id: "attacks",
  label: "Attaques",
  icon: "fas fa-khanda",
  build(snapshot) {
    return snapshot.weapons
      .filter((weapon) => weapon.worn)
      .map((weapon) => entry({
        id: weapon.id,
        name: weapon.name,
        img: weapon.img,
        ...ammoStatus(weapon, snapshot.ammo),
        action: { type: "rollWeapon", itemId: weapon.id }
      }));
  }
};

const HANDS_LABEL = { one: "1 main", two: "2 mains", off: "Main faible" };

function equipmentBadge(item) {
  if (item.isShield) {
    return "Bouclier";
  }
  if (item.hands !== undefined) {
    return HANDS_LABEL[item.hands] ?? HANDS_LABEL.one;
  }
  return "Armure";
}

const equipmentSection = {
  id: "equipment",
  label: "Équipement",
  icon: "fas fa-shield-halved",
  build(snapshot) {
    return [...snapshot.weapons, ...snapshot.armors].map((item) => entry({
      id: item.id,
      name: item.name,
      img: item.img,
      badge: equipmentBadge(item),
      active: item.worn,
      warning: requirementWarning(item, snapshot.attributes),
      action: { type: "toggleWear", itemId: item.id }
    }));
  }
};

const NO_TRADITION = "Sans tradition";

function traditionOf(spell) {
  return spell.tradition?.trim() || NO_TRADITION;
}

// Traditions par ordre alphabétique, les sorts sans tradition à la fin.
function compareTraditions(a, b) {
  if (a === NO_TRADITION) {
    return 1;
  }
  if (b === NO_TRADITION) {
    return -1;
  }
  return a.localeCompare(b);
}

function compareSpells(a, b) {
  if (a.rank !== b.rank) {
    return a.rank - b.rank;
  }
  return a.name.localeCompare(b.name);
}

function spellBadge(spell, uses) {
  if (uses.badge) {
    return `R${spell.rank} · ${uses.badge}`;
  }
  return `R${spell.rank}`;
}

function spellCountLabel(count) {
  if (count > 1) {
    return `${count} sorts`;
  }
  return `${count} sort`;
}

function spellEntries(spells) {
  return [...spells].sort(compareSpells).map((spell) => {
    const uses = limitedUses(spell.used, spell.max);
    return entry({
      id: spell.id,
      name: spell.name,
      img: spell.img,
      badge: spellBadge(spell, uses),
      disabled: uses.exhausted,
      action: { type: "castSpell", itemId: spell.id }
    });
  });
}

/**
 * Deux niveaux : la liste des traditions, puis les sorts de la tradition
 * choisie (`view.tradition`). Une seule tradition : on montre les sorts directement.
 */
const spellsSection = {
  id: "spells",
  label: "Sorts",
  icon: "fas fa-wand-sparkles",
  build(snapshot, view = {}) {
    const byTradition = new Map();
    for (const spell of snapshot.spells) {
      const tradition = traditionOf(spell);
      if (!byTradition.has(tradition)) {
        byTradition.set(tradition, []);
      }
      byTradition.get(tradition).push(spell);
    }

    if (byTradition.size <= 1) {
      return spellEntries(snapshot.spells);
    }

    const selected = byTradition.get(view.tradition);
    if (selected) {
      const back = backEntry(view.tradition);
      return [back, ...spellEntries(selected)];
    }

    return [...byTradition.keys()].sort(compareTraditions).map((tradition) => entry({
      id: tradition,
      name: tradition,
      icon: "fas fa-book-open",
      badge: spellCountLabel(byTradition.get(tradition).length),
      action: { type: "navigate", view: { tradition } }
    }));
  }
};

const talentsSection = {
  id: "talents",
  label: "Talents",
  icon: "fas fa-star",
  build(snapshot) {
    return snapshot.talents.map((talent) => {
      const uses = limitedUses(talent.used, talent.max);
      return entry({
        id: talent.id,
        name: talent.name,
        img: talent.img,
        badge: uses.badge,
        disabled: uses.exhausted,
        action: { type: "useTalent", itemId: talent.id }
      });
    });
  }
};

const itemsSection = {
  id: "items",
  label: "Objets",
  icon: "fas fa-flask",
  build(snapshot) {
    return snapshot.consumables.map((item) => entry({
      id: item.id,
      name: item.name,
      img: item.img,
      badge: `×${item.quantity}`,
      disabled: item.quantity < 1,
      action: { type: "useItem", itemId: item.id }
    }));
  }
};

/**
 * Jets de caractéristique, puis les professions. Choisir une profession
 * (`view.professionId`) propose la caractéristique à lancer ; les faveurs et
 * fléaux éventuels se règlent dans le HUD.
 */
const attributesSection = {
  id: "attributes",
  label: "Caractéristiques",
  icon: "fas fa-dice-d20",
  build(snapshot, view = {}) {
    const profession = snapshot.professions.find((candidate) => candidate.id === view.professionId);
    if (profession) {
      const back = backEntry(profession.name);
      const choices = snapshot.attributes.map((attribute) => entry({
        id: attribute.key,
        name: attribute.label,
        badge: attributeBadge(attribute),
        action: { type: "rollProfession", attribute: attribute.key }
      }));
      return [back, ...choices];
    }

    const attributes = snapshot.attributes.map((attribute) => entry({
      id: attribute.key,
      name: attribute.label,
      badge: attributeBadge(attribute),
      action: { type: "rollChallenge", attribute: attribute.key }
    }));
    const professions = snapshot.professions.map((item) => entry({
      id: item.id,
      name: item.name,
      img: item.img,
      badge: "Profession",
      action: { type: "navigate", view: { professionId: item.id } }
    }));
    return [...attributes, ...professions];
  }
};

// Nom affiché sans l'identifiant anglais : « Affaibli (weakened) » → « Affaibli ».
function afflictionName(affliction) {
  return affliction.name.replace(/\s*\([^)]*\)\s*$/, "");
}

/**
 * Deux niveaux : les afflictions actives avec leur effet (clic pour la
 * retirer), puis la liste des autres afflictions à ajouter (`view.adding`).
 * Le catalogue et les descriptions viennent de l'aide de jeu du compagnon.
 */
const afflictionsSection = {
  id: "afflictions",
  label: "Afflictions",
  icon: "fas fa-person-falling-burst",
  build(snapshot, view = {}) {
    const catalogue = SODL_CONFIG.afflictions.list;
    const toEntry = (affliction, active) => entry({
      id: affliction.id,
      name: afflictionName(affliction),
      description: affliction.description,
      active,
      action: { type: "toggleStatus", statusId: affliction.id }
    });

    if (view.adding) {
      const back = backEntry("Afflictions actives");
      const inactive = catalogue.filter((affliction) => !snapshot.statuses.includes(affliction.id));
      return [back, ...inactive.map((affliction) => toEntry(affliction, false))];
    }

    const active = catalogue.filter((affliction) => snapshot.statuses.includes(affliction.id));
    let entries = active.map((affliction) => toEntry(affliction, true));
    if (entries.length === 0) {
      entries = [entry({ id: "none", name: "Aucune affliction", disabled: true })];
    }
    const add = entry({
      id: "add",
      name: "Ajouter une affliction",
      icon: "fas fa-plus",
      action: { type: "navigate", view: { adding: true } }
    });
    return [...entries, add];
  }
};

const SECTIONS_BY_ACTOR_TYPE = {
  character: [attacksSection, equipmentSection, spellsSection, talentsSection, itemsSection, attributesSection, afflictionsSection],
  creature: [attacksSection, spellsSection, talentsSection, attributesSection, afflictionsSection]
};

// Fabrique : les onglets disponibles selon le type d'acteur.
export function createSections(actorType) {
  return SECTIONS_BY_ACTOR_TYPE[actorType] ?? [];
}
