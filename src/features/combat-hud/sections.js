/**
 * Onglets du HUD de combat (stratégies). Chaque onglet sait construire ses
 * entrées à partir de la vue normalisée de l'acteur (cf. actor-adapter.js) ;
 * il ne touche jamais à Foundry. Une entrée décrit ce qu'on affiche et l'action
 * déclenchée au clic, exécutée ensuite par l'adapter.
 *
 * Entrée : { id, name, img, icon, badge, disabled, active, warning, action }
 * Une action `navigate` ne touche pas l'acteur : elle remplace la vue de
 * l'onglet (`view`, passée en second argument de `build`), gérée par le HUD.
 */

function entry(fields) {
  return { img: "", icon: "", badge: "", disabled: false, active: false, warning: "", ...fields };
}

function formatModifier(modifier) {
  if (modifier > 0) {
    return `+${modifier}`;
  }
  return `${modifier}`;
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
      const back = entry({
        id: "back",
        name: `← ${view.tradition}`,
        action: { type: "navigate", view: {} }
      });
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

const attributesSection = {
  id: "attributes",
  label: "Caractéristiques",
  icon: "fas fa-dice-d20",
  build(snapshot) {
    const attributes = snapshot.attributes.map((attribute) => entry({
      id: attribute.key,
      name: attribute.label,
      badge: `${attribute.value} (${formatModifier(attribute.modifier ?? 0)})`,
      action: { type: "rollChallenge", attribute: attribute.key }
    }));
    const professions = snapshot.professions.map((profession) => entry({
      id: profession.id,
      name: profession.name,
      img: profession.img,
      badge: "Profession",
      action: { type: "rollProfession", itemId: profession.id }
    }));
    return [...attributes, ...professions];
  }
};

const SECTIONS_BY_ACTOR_TYPE = {
  character: [attacksSection, equipmentSection, spellsSection, talentsSection, itemsSection, attributesSection],
  creature: [attacksSection, spellsSection, talentsSection, attributesSection]
};

// Fabrique : les onglets disponibles selon le type d'acteur.
export function createSections(actorType) {
  return SECTIONS_BY_ACTOR_TYPE[actorType] ?? [];
}
