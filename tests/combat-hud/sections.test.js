import { test } from "node:test";
import assert from "node:assert/strict";
import { createSections } from "../../src/features/combat-hud/sections.js";
import { t } from "../helpers/i18n.js";

function section(actorType, id) {
  const found = createSections(actorType).find((candidate) => candidate.id === id);
  return { build: (snapshot, view = {}) => found.build(snapshot, view, t) };
}

function emptySnapshot(overrides) {
  return {
    attributes: [],
    weapons: [],
    armors: [],
    ammo: [],
    spells: [],
    talents: [],
    consumables: [],
    professions: [],
    statuses: [],
    effects: [],
    ...overrides
  };
}

test("un personnage a tous les onglets, une créature n'a pas l'équipement ni les objets", () => {
  const characterIds = createSections("character").map((candidate) => candidate.id);
  const creatureIds = createSections("creature").map((candidate) => candidate.id);
  assert.deepEqual(characterIds, ["attacks", "equipment", "spells", "talents", "items", "attributes", "actions", "fortune", "afflictions", "effects"]);
  assert.deepEqual(creatureIds, ["attacks", "spells", "talents", "attributes", "actions", "afflictions", "effects"]);
});

test("les attaques ne listent que les armes portées", () => {
  const snapshot = emptySnapshot({
    weapons: [
      { id: "sword", name: "Épée", worn: true, ammo: { required: false } },
      { id: "bow", name: "Arc", worn: false, ammo: { required: false } }
    ]
  });
  const names = section("character", "attacks").build(snapshot).map((entry) => entry.name);
  assert.deepEqual(names, ["Épée"]);
});

test("une arme à munitions affiche le stock et se désactive quand il est vide", () => {
  const snapshot = emptySnapshot({
    weapons: [{ id: "bow", name: "Arc", worn: true, ammo: { required: true, itemId: "arrows", amount: 1 } }],
    ammo: [{ id: "arrows", name: "Flèches", quantity: 0 }]
  });
  const [entry] = section("character", "attacks").build(snapshot);
  assert.equal(entry.badge, "0");
  assert.equal(entry.disabled, true);
});

test("une arme à munitions sans munition liée est désactivée", () => {
  const snapshot = emptySnapshot({
    weapons: [{ id: "bow", name: "Arc", worn: true, ammo: { required: true, itemId: "", amount: 1 } }]
  });
  const [entry] = section("character", "attacks").build(snapshot);
  assert.equal(entry.disabled, true);
  assert.equal(entry.warning, "Aucune munition associée");
});

test("l'équipement signale un prérequis de caractéristique non rempli", () => {
  const snapshot = emptySnapshot({
    attributes: [{ key: "strength", label: "Force", value: 10 }],
    weapons: [{ id: "xbow", name: "Arbalète lourde", worn: false, hands: "two", requirement: { attribute: "strength", min: 12 }, ammo: { required: false } }]
  });
  const entry = section("character", "equipment").build(snapshot).find((candidate) => candidate.id === "xbow");
  assert.equal(entry.warning, "Requiert Force 12 : 1 fléau");
  assert.deepEqual(entry.action, { type: "toggleWear", itemId: "xbow" });
});

test("avec plusieurs traditions, l'onglet sorts liste d'abord les traditions", () => {
  const snapshot = emptySnapshot({
    spells: [
      { id: "s1", name: "Mort lente", tradition: "Nécromancie", rank: 1, used: 0, max: 2 },
      { id: "s2", name: "Flamme", tradition: "Feu", rank: 0, used: 0, max: 3 },
      { id: "s3", name: "Boule de feu", tradition: "Feu", rank: 2, used: 0, max: 1 },
      { id: "s4", name: "Lueur", tradition: "", rank: 0, used: 0, max: 0 }
    ]
  });
  const entries = section("character", "spells").build(snapshot, {});
  assert.deepEqual(
    entries.map((entry) => [entry.name, entry.badge, entry.action]),
    [
      ["Feu", "2 sorts", { type: "navigate", view: { tradition: "Feu" } }],
      ["Nécromancie", "1 sort", { type: "navigate", view: { tradition: "Nécromancie" } }],
      ["Sans tradition", "1 sort", { type: "navigate", view: { tradition: "" } }]
    ]
  );
});

test("une tradition choisie affiche un retour puis ses sorts triés par rang", () => {
  const snapshot = emptySnapshot({
    spells: [
      { id: "s1", name: "Boule de feu", tradition: "Feu", rank: 2, used: 0, max: 1 },
      { id: "s2", name: "Mort lente", tradition: "Nécromancie", rank: 1, used: 0, max: 2 },
      { id: "s3", name: "Flamme", tradition: "Feu", rank: 0, used: 1, max: 3 }
    ]
  });
  const entries = section("character", "spells").build(snapshot, { tradition: "Feu" });
  assert.deepEqual(
    entries.map((entry) => [entry.name, entry.badge, entry.action]),
    [
      ["Feu", "Retour", { type: "navigate", view: {} }],
      ["Flamme", "R0 · 2/3", { type: "castSpell", itemId: "s3" }],
      ["Boule de feu", "R2 · 1/1", { type: "castSpell", itemId: "s1" }]
    ]
  );
});

test("avec une seule tradition, les sorts sont affichés directement", () => {
  const snapshot = emptySnapshot({
    spells: [
      { id: "s1", name: "Éclair", tradition: "Tempête", rank: 1, used: 2, max: 2 },
      { id: "s2", name: "Lueur", tradition: "Tempête", rank: 0, used: 0, max: 0 }
    ]
  });
  const entries = section("character", "spells").build(snapshot, {});
  assert.deepEqual(
    entries.map((entry) => [entry.name, entry.badge, entry.disabled]),
    [["Lueur", "R0", false], ["Éclair", "R1 · 0/2", true]]
  );
});

test("une tradition choisie qui n'existe plus ramène à la liste des traditions", () => {
  const snapshot = emptySnapshot({
    spells: [
      { id: "s1", name: "Flamme", tradition: "Feu", rank: 0, used: 0, max: 1 },
      { id: "s2", name: "Mort lente", tradition: "Nécromancie", rank: 1, used: 0, max: 1 }
    ]
  });
  const names = section("character", "spells").build(snapshot, { tradition: "Ombre" }).map((entry) => entry.name);
  assert.deepEqual(names, ["Feu", "Nécromancie"]);
});

test("un talent sans limite d'utilisation n'affiche pas de compteur", () => {
  const snapshot = emptySnapshot({ talents: [{ id: "t1", name: "Riposte", used: 0, max: 0 }] });
  const [entry] = section("character", "talents").build(snapshot);
  assert.equal(entry.badge, "");
  assert.equal(entry.disabled, false);
});

test("un consommable épuisé est désactivé", () => {
  const snapshot = emptySnapshot({ consumables: [{ id: "p1", name: "Potion", quantity: 0 }] });
  const [entry] = section("character", "items").build(snapshot);
  assert.equal(entry.badge, "×0");
  assert.equal(entry.disabled, true);
});

test("l'onglet caractéristiques propose les jets d'attribut puis les professions", () => {
  const snapshot = emptySnapshot({
    attributes: [{ key: "agility", label: "Agilité", value: 12, modifier: 2 }],
    professions: [{ id: "p1", name: "Forgeron" }]
  });
  const entries = section("character", "attributes").build(snapshot);
  assert.deepEqual(
    entries.map((entry) => [entry.name, entry.badge, entry.action]),
    [
      ["Agilité", "12 (+2)", { type: "rollChallenge", attribute: "agility", rollOptions: true }],
      ["Forgeron", "Profession", { type: "navigate", view: { professionId: "p1" } }]
    ]
  );
});

test("l'onglet afflictions liste les afflictions actives avec leur effet, puis un accès pour en ajouter", () => {
  const snapshot = emptySnapshot({ statuses: ["prone", "injured"] });
  const entries = section("character", "afflictions").build(snapshot, {});
  assert.deepEqual(
    entries.map((entry) => [entry.name, entry.active, entry.action]),
    [
      ["À terre", true, { type: "toggleStatus", statusId: "prone" }],
      ["Ajouter une affliction", false, { type: "navigate", view: { adding: true } }]
    ]
  );
  assert.match(entries[0].description, /Se relever coûte le déplacement/);
  assert.equal(entries[0].ruleRef, "afflictions:prone");
});

test("sans affliction active, l'onglet l'indique et propose d'en ajouter", () => {
  const entries = section("character", "afflictions").build(emptySnapshot(), {});
  assert.deepEqual(entries.map((entry) => entry.name), ["Aucune affliction", "Ajouter une affliction"]);
  assert.equal(entries[0].disabled, true);
});

test("la liste d'ajout propose les afflictions inactives, précédées d'un retour", () => {
  const snapshot = emptySnapshot({ statuses: ["impaired"] });
  const entries = section("character", "afflictions").build(snapshot, { adding: true });
  const names = entries.map((entry) => entry.name);
  assert.equal(names[0], "Afflictions actives");
  assert.equal(entries[0].variant, "back");
  assert.equal(names.includes("Affaibli"), false);
  assert.equal(names.includes("Aveuglé"), true);
  const blinded = entries.find((entry) => entry.name === "Aveuglé");
  assert.deepEqual(blinded.action, { type: "toggleStatus", statusId: "blinded" });
});

test("une profession choisie propose de lancer chaque caractéristique", () => {
  const snapshot = emptySnapshot({
    attributes: [
      { key: "strength", label: "Force", value: 11, modifier: 1 },
      { key: "intellect", label: "Intelligence", value: 10, modifier: 0 }
    ],
    professions: [{ id: "p1", name: "Fermière" }]
  });
  const entries = section("character", "attributes").build(snapshot, { professionId: "p1" });
  assert.deepEqual(
    entries.map((entry) => [entry.name, entry.badge, entry.action]),
    [
      ["Fermière", "Retour", { type: "navigate", view: {} }],
      ["Force", "11 (+1)", { type: "rollProfession", attribute: "strength", rollOptions: true }],
      ["Intelligence", "10 (0)", { type: "rollProfession", attribute: "intellect", rollOptions: true }]
    ]
  );
});

test("seuls les jets qui demandent des faveurs/fléaux au système ouvrent le panneau de jet", () => {
  const snapshot = emptySnapshot({
    weapons: [{ id: "w1", name: "Épée", worn: true, ammo: { required: false } }],
    spells: [
      { id: "s1", name: "Éclair", tradition: "Tempête", rank: 1, used: 0, max: 2, rollsAttack: true },
      { id: "s2", name: "Lueur", tradition: "Tempête", rank: 0, used: 0, max: 0, rollsAttack: false }
    ],
    talents: [{ id: "t1", name: "Riposte", used: 0, max: 0, rollsAttack: true }],
    consumables: [{ id: "p1", name: "Potion", quantity: 1, rollsAttack: false }]
  });
  const flag = (id) => section("character", id).build(snapshot, {}).map((entry) => [entry.name, Boolean(entry.action.rollOptions)]);
  assert.deepEqual(flag("attacks"), [["Épée", true]]);
  assert.deepEqual(flag("spells"), [["Lueur", false], ["Éclair", true]]);
  assert.deepEqual(flag("talents"), [["Riposte", true]]);
  assert.deepEqual(flag("items"), [["Potion", false]]);
});

test("les professions commencent sur une nouvelle ligne, après les caractéristiques", () => {
  const snapshot = emptySnapshot({
    attributes: [{ key: "strength", label: "Force", value: 10, modifier: 0 }],
    professions: [{ id: "p1", name: "Ouvrier" }, { id: "p2", name: "Évangéliste" }]
  });
  const entries = section("character", "attributes").build(snapshot, {});
  assert.deepEqual(entries.map((entry) => [entry.name, entry.newRow]), [["Force", false], ["Ouvrier", true], ["Évangéliste", false]]);
});

test("l'équipement est rangé en armes, protections puis munitions, chaque catégorie sur sa ligne", () => {
  const snapshot = emptySnapshot({
    weapons: [{ id: "bow", name: "Arc", worn: true, hands: "two", ammo: { required: true, itemId: "arrows", amount: 1 } }],
    armors: [{ id: "leather", name: "Cuir", worn: true, isShield: false }],
    ammo: [{ id: "arrows", name: "Flèches", quantity: 0 }]
  });
  const entries = section("character", "equipment").build(snapshot);
  assert.deepEqual(
    entries.map((entry) => [entry.name, entry.isHeading, entry.newRow, entry.badge]),
    [
      ["Armes", true, true, ""],
      ["Arc", false, false, "2 mains"],
      ["Protections", true, true, ""],
      ["Cuir", false, false, "Armure"],
      ["Munitions", true, true, ""],
      ["Flèches", false, false, "×0"]
    ]
  );
  const arrows = entries.find((entry) => entry.id === "arrows");
  assert.equal(arrows.disabled, true);
  assert.equal(arrows.action, null);
  assert.equal(arrows.itemId, "arrows");
});

test("une catégorie d'équipement vide n'est pas affichée", () => {
  const snapshot = emptySnapshot({ weapons: [{ id: "knife", name: "Couteau", worn: false, hands: "one", ammo: { required: false } }] });
  const names = section("character", "equipment").build(snapshot).map((entry) => entry.name);
  assert.deepEqual(names, ["Armes", "Couteau"]);
});

test("seuls les sorts et talents à utilisations limitées peuvent être corrigés à la main", () => {
  const snapshot = emptySnapshot({
    spells: [
      { id: "s1", name: "Éclair", tradition: "Tempête", rank: 1, used: 1, max: 2 },
      { id: "s2", name: "Lueur", tradition: "Tempête", rank: 0, used: 0, max: 0 }
    ],
    talents: [{ id: "t1", name: "Riposte", used: 0, max: 1 }]
  });
  const spells = section("character", "spells").build(snapshot, {}).map((entry) => [entry.name, entry.usesItemId]);
  const talents = section("character", "talents").build(snapshot, {}).map((entry) => [entry.name, entry.usesItemId]);
  assert.deepEqual(spells, [["Lueur", ""], ["Éclair", "s1"]]);
  assert.deepEqual(talents, [["Riposte", "t1"]]);
});

test("l'onglet effets liste les effets temporaires hors afflictions, puis un accès pour en créer un", () => {
  const snapshot = emptySnapshot({
    effects: [
      { id: "e1", name: "Bénédiction", img: "b.webp", disabled: false, statuses: [], duration: "3 rounds" },
      { id: "e2", name: "À terre", img: "p.svg", disabled: false, statuses: ["prone"], duration: "" },
      { id: "e3", name: "Blessé", img: "i.svg", disabled: false, statuses: ["injured"], duration: "" },
      { id: "e4", name: "Rage", img: "r.webp", disabled: true, statuses: [], duration: "" }
    ]
  });
  const entries = section("character", "effects").build(snapshot, {});
  assert.deepEqual(
    entries.map((entry) => [entry.name, entry.badge, entry.active, entry.action]),
    [
      ["Bénédiction", "3 rounds", true, { type: "toggleEffect", effectId: "e1" }],
      ["Rage", "Inactif", false, { type: "toggleEffect", effectId: "e4" }],
      ["Nouvel effet", "", false, { type: "createEffect" }]
    ]
  );
  assert.equal(entries[0].effectId, "e1");
});

test("l'onglet actions regroupe les actions de l'aide de jeu, chacune envoyant sa règle dans le chat", () => {
  const entries = section("character", "actions").build(emptySnapshot(), {});
  const headings = entries.filter((entry) => entry.isHeading).map((entry) => entry.name);
  assert.deepEqual(headings, ["Actions", "Options en Mêlée", "Options de Tir", "Autres Types d'Attaques"]);
  const defend = entries.find((entry) => entry.name === "Se défendre");
  assert.deepEqual(defend.action, { type: "postRule", ruleRef: "actions:8" });
  assert.match(defend.description, /1 Desav/);
});

test("l'onglet fortune liste les utilisations de la Fortune", () => {
  const entries = section("character", "fortune").build(emptySnapshot(), {});
  const bane = entries.find((entry) => entry.name === "Imposer des fléaux");
  assert.deepEqual(bane.action, { type: "spendFortune", useIndex: 0 });
  assert.match(bane.description, /2 fléaux/);
});
