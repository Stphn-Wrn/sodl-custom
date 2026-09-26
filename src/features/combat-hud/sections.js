import { SODL_CONFIG } from "../companion/config.js";
import { localizeTree } from "../../shared/i18n.js";

const NO_TRADITION = "";
const HEALTH_STATUSES = ["injured", "incapacitated", "disabled", "dying", "dead"];
const HANDS_KEYS = { one: "SODL.Hud.Hands.One", two: "SODL.Hud.Hands.Two", off: "SODL.Hud.Hands.Off" };

function entry(fields) {
  return { img: "", icon: "", badge: "", description: "", ruleRef: "", variant: "", newRow: false, isHeading: false, itemId: "", usesItemId: "", effectId: "", disabled: false, active: false, warning: "", ...fields };
}

function backEntry(label, t) {
  return entry({
    id: "back",
    name: label,
    icon: "fas fa-arrow-left",
    badge: t("SODL.Hud.Back"),
    variant: "back",
    action: { type: "navigate", view: {} }
  });
}

function withRollOptions(action, needed) {
  if (!needed) {
    return action;
  }
  return { ...action, rollOptions: true };
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

function usesItemId(item) {
  if (item.max > 0) {
    return item.id;
  }
  return "";
}

function limitedUses(used, max) {
  if (max <= 0) {
    return { badge: "", exhausted: false };
  }
  const remaining = Math.max(0, max - used);
  return { badge: `${remaining}/${max}`, exhausted: remaining === 0 };
}

function requirementWarning(item, attributes, t) {
  const requirement = item.requirement;
  if (!requirement?.attribute || !requirement.min) {
    return "";
  }
  const attribute = attributes.find((candidate) => candidate.key === requirement.attribute);
  if (!attribute || attribute.value >= requirement.min) {
    return "";
  }
  return t("SODL.Hud.RequirementBane", { attribute: attribute.label, min: requirement.min });
}

function ammoStatus(weapon, ammo, t) {
  if (!weapon.ammo?.required) {
    return { badge: "", disabled: false, warning: "" };
  }
  const stock = ammo.find((candidate) => candidate.id === weapon.ammo.itemId);
  if (!stock) {
    return { badge: "", disabled: true, warning: t("SODL.Hud.NoAmmoLinked") };
  }
  const amount = weapon.ammo.amount || 1;
  if (stock.quantity < amount) {
    return { badge: `${stock.quantity}`, disabled: true, warning: t("SODL.Hud.OutOfAmmo", { name: stock.name }) };
  }
  return { badge: `${stock.quantity}`, disabled: false, warning: "" };
}

const attacksSection = {
  id: "attacks",
  label: "SODL.Hud.Tabs.Attacks",
  icon: "fas fa-khanda",
  build(snapshot, view, t) {
    return snapshot.weapons
      .filter((weapon) => weapon.worn)
      .map((weapon) => entry({
        id: weapon.id,
        name: weapon.name,
        img: weapon.img,
        ...ammoStatus(weapon, snapshot.ammo, t),
        action: withRollOptions({ type: "rollWeapon", itemId: weapon.id }, true)
      }));
  }
};

function equipmentBadge(item, t) {
  if (item.isShield) {
    return t("SODL.Hud.Shield");
  }
  if (item.hands !== undefined) {
    return t(HANDS_KEYS[item.hands] ?? HANDS_KEYS.one);
  }
  return t("SODL.Hud.Armor");
}

function headingEntry(label) {
  return entry({ id: `heading-${label}`, name: label, isHeading: true, newRow: true, action: null });
}

function wearableEntry(item, attributes, t) {
  return entry({
    id: item.id,
    name: item.name,
    img: item.img,
    badge: equipmentBadge(item, t),
    active: item.worn,
    warning: requirementWarning(item, attributes, t),
    action: { type: "toggleWear", itemId: item.id }
  });
}

function ammoEntry(ammo) {
  return entry({
    id: ammo.id,
    name: ammo.name,
    img: ammo.img,
    badge: `×${ammo.quantity}`,
    disabled: ammo.quantity < 1,
    itemId: ammo.id,
    action: null
  });
}

const equipmentSection = {
  id: "equipment",
  label: "SODL.Hud.Tabs.Equipment",
  icon: "fas fa-shield-halved",
  build(snapshot, view, t) {
    const groups = [
      [t("SODL.Hud.Groups.Weapons"), snapshot.weapons.map((item) => wearableEntry(item, snapshot.attributes, t))],
      [t("SODL.Hud.Groups.Protections"), snapshot.armors.map((item) => wearableEntry(item, snapshot.attributes, t))],
      [t("SODL.Hud.Groups.Ammunition"), snapshot.ammo.map(ammoEntry)]
    ];
    return groups
      .filter(([, entries]) => entries.length > 0)
      .flatMap(([label, entries]) => [headingEntry(label), ...entries]);
  }
};

function traditionOf(spell) {
  return spell.tradition?.trim() || NO_TRADITION;
}

function traditionLabel(tradition, t) {
  if (tradition === NO_TRADITION) {
    return t("SODL.Hud.NoTradition");
  }
  return tradition;
}

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

function spellCountLabel(count, t) {
  if (count > 1) {
    return t("SODL.Hud.SpellCount.Many", { count });
  }
  return t("SODL.Hud.SpellCount.One", { count });
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
      usesItemId: usesItemId(spell),
      action: withRollOptions({ type: "castSpell", itemId: spell.id }, spell.rollsAttack)
    });
  });
}

const spellsSection = {
  id: "spells",
  label: "SODL.Hud.Tabs.Spells",
  icon: "fas fa-wand-sparkles",
  build(snapshot, view, t) {
    const byTradition = new Map();
    for (const spell of snapshot.spells) {
      const tradition = traditionOf(spell);
      if (!byTradition.has(tradition)) {
        byTradition.set(tradition, []);
      }
      byTradition.get(tradition).push(spell);
    }

    if (byTradition.size <= 1 || view.all) {
      return spellEntries(snapshot.spells);
    }

    const selected = byTradition.get(view.tradition);
    if (selected) {
      return [backEntry(traditionLabel(view.tradition, t), t), ...spellEntries(selected)];
    }

    return [...byTradition.keys()].sort(compareTraditions).map((tradition) => entry({
      id: `tradition-${tradition}`,
      name: traditionLabel(tradition, t),
      icon: "fas fa-book-open",
      badge: spellCountLabel(byTradition.get(tradition).length, t),
      action: { type: "navigate", view: { tradition } }
    }));
  }
};

const talentsSection = {
  id: "talents",
  label: "SODL.Hud.Tabs.Talents",
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
        usesItemId: usesItemId(talent),
        action: withRollOptions({ type: "useTalent", itemId: talent.id }, talent.rollsAttack)
      });
    });
  }
};

const itemsSection = {
  id: "items",
  label: "SODL.Hud.Tabs.Items",
  icon: "fas fa-flask",
  build(snapshot) {
    return snapshot.consumables.map((item) => entry({
      id: item.id,
      name: item.name,
      img: item.img,
      badge: `×${item.quantity}`,
      disabled: item.quantity < 1,
      action: withRollOptions({ type: "useItem", itemId: item.id }, item.rollsAttack)
    }));
  }
};

const attributesSection = {
  id: "attributes",
  label: "SODL.Hud.Tabs.Attributes",
  icon: "fas fa-dice-d20",
  build(snapshot, view, t) {
    const profession = snapshot.professions.find((candidate) => candidate.id === view.professionId);
    if (profession) {
      const choices = snapshot.attributes.map((attribute) => entry({
        id: attribute.key,
        name: attribute.label,
        badge: attributeBadge(attribute),
        action: withRollOptions({ type: "rollProfession", attribute: attribute.key }, true)
      }));
      return [backEntry(profession.name, t), ...choices];
    }

    const attributes = snapshot.attributes.map((attribute) => entry({
      id: attribute.key,
      name: attribute.label,
      badge: attributeBadge(attribute),
      action: withRollOptions({ type: "rollChallenge", attribute: attribute.key }, true)
    }));
    const professions = snapshot.professions.map((item, index) => entry({
      id: item.id,
      newRow: index === 0,
      name: item.name,
      img: item.img,
      badge: t("SODL.Hud.Profession"),
      action: { type: "navigate", view: { professionId: item.id } }
    }));
    return [...attributes, ...professions];
  }
};

export function afflictionName(affliction) {
  return affliction.name.replace(/\s*\([^)]*\)\s*$/, "");
}

export function afflictionCatalogue(t) {
  return localizeTree(SODL_CONFIG.afflictions.list, t);
}

const ACTION_GROUPS = [
  ["actions", "SODL.Hud.Groups.Actions"],
  ["meleeOptions", "SODL.Companion.Sections.Melee"],
  ["rangedOptions", "SODL.Companion.Sections.Ranged"],
  ["otherAttacks", "SODL.Companion.Sections.OtherAttacks"]
];

export function ruleByRef(ref, t) {
  const [group, key] = ref.split(":");
  const list = SODL_CONFIG[group]?.list;
  if (!list) {
    return null;
  }
  let rule = list[Number(key)];
  if (group === "afflictions") {
    rule = list.find((candidate) => candidate.id === key);
  }
  if (!rule) {
    return null;
  }
  const localized = localizeTree(rule, t);
  return { name: afflictionName(localized), description: localized.description };
}

const actionsSection = {
  id: "actions",
  label: "SODL.Hud.Tabs.Actions",
  icon: "fas fa-person-running",
  build(snapshot, view, t) {
    return ACTION_GROUPS.flatMap(([group, labelKey]) => {
      const rules = localizeTree(SODL_CONFIG[group].list, t).map((rule, index) => {
        const ruleRef = `${group}:${index}`;
        return entry({
          id: ruleRef,
          name: rule.name,
          description: rule.description,
          action: { type: "postRule", ruleRef }
        });
      });
      return [headingEntry(t(labelKey)), ...rules];
    });
  }
};

const afflictionsSection = {
  id: "afflictions",
  label: "SODL.Hud.Tabs.Afflictions",
  icon: "fas fa-person-falling-burst",
  build(snapshot, view, t) {
    const catalogue = afflictionCatalogue(t);
    const toEntry = (affliction, active) => entry({
      id: affliction.id,
      name: afflictionName(affliction),
      description: affliction.description,
      ruleRef: `afflictions:${affliction.id}`,
      active,
      action: { type: "toggleStatus", statusId: affliction.id }
    });

    if (view.adding) {
      const inactive = catalogue.filter((affliction) => !snapshot.statuses.includes(affliction.id));
      return [backEntry(t("SODL.Hud.ActiveAfflictions"), t), ...inactive.map((affliction) => toEntry(affliction, false))];
    }

    const active = catalogue.filter((affliction) => snapshot.statuses.includes(affliction.id));
    let entries = active.map((affliction) => toEntry(affliction, true));
    if (entries.length === 0) {
      entries = [entry({ id: "none", name: t("SODL.Hud.NoAffliction"), disabled: true })];
    }
    const add = entry({
      id: "add",
      name: t("SODL.Hud.AddAffliction"),
      icon: "fas fa-plus",
      action: { type: "navigate", view: { adding: true } }
    });
    return [...entries, add];
  }
};

const fortuneSection = {
  id: "fortune",
  label: "SODL.Hud.Tabs.Fortune",
  icon: "fas fa-clover",
  build(snapshot, view, t) {
    const uses = localizeTree(SODL_CONFIG.chancePointsRules.extendedUses, t).map((use, index) => entry({
      id: `fortune-use-${index}`,
      name: use.name,
      description: use.description,
      action: { type: "spendFortune", useIndex: index }
    }));
    return uses;
  }
};

export function fortuneUse(index, t) {
  const use = SODL_CONFIG.chancePointsRules.extendedUses[index];
  if (!use) {
    return null;
  }
  return localizeTree(use, t);
}

function isTemporaryEffect(effect) {
  const afflictionIds = SODL_CONFIG.afflictions.list.map((affliction) => affliction.id);
  return !effect.statuses.some((status) => afflictionIds.includes(status) || HEALTH_STATUSES.includes(status));
}

function effectBadge(effect, t) {
  if (effect.disabled) {
    return t("SODL.Hud.Inactive");
  }
  return effect.duration;
}

const effectsSection = {
  id: "effects",
  label: "SODL.Hud.Tabs.Effects",
  icon: "fas fa-hourglass-half",
  build(snapshot, view, t) {
    const effects = snapshot.effects.filter(isTemporaryEffect).map((effect) => entry({
      id: effect.id,
      name: effect.name,
      img: effect.img,
      badge: effectBadge(effect, t),
      active: !effect.disabled,
      effectId: effect.id,
      action: { type: "toggleEffect", effectId: effect.id }
    }));
    const create = entry({ id: "create", name: t("SODL.Hud.NewEffect"), icon: "fas fa-plus", action: { type: "createEffect" } });
    return [...effects, create];
  }
};

const SECTIONS_BY_ACTOR_TYPE = {
  character: [attacksSection, equipmentSection, spellsSection, talentsSection, itemsSection, attributesSection, actionsSection, fortuneSection, afflictionsSection, effectsSection],
  creature: [attacksSection, spellsSection, talentsSection, attributesSection, actionsSection, afflictionsSection, effectsSection]
};

export function createSections(actorType) {
  return SECTIONS_BY_ACTOR_TYPE[actorType] ?? [];
}
