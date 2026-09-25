import { test } from "node:test";
import assert from "node:assert/strict";
import { planEquip, planUnequip } from "../../src/features/combat-hud/equipment-rules.js";

test("équiper une arme à une main quand les mains sont libres ne range rien", () => {
  const items = [{ id: "sword", type: "weapon", hands: "one", worn: false }];
  const expected = [{ id: "sword", worn: true }];
  assert.deepEqual(planEquip(items, "sword"), expected);
});

test("équiper une arme à deux mains range toutes les armes et le bouclier portés", () => {
  const items = [
    { id: "sword", type: "weapon", hands: "one", worn: true },
    { id: "shield", type: "armor", isShield: true, worn: true },
    { id: "leather", type: "armor", isShield: false, worn: true },
    { id: "greatsword", type: "weapon", hands: "two", worn: false }
  ];
  const expected = [
    { id: "sword", worn: false },
    { id: "shield", worn: false },
    { id: "greatsword", worn: true }
  ];
  assert.deepEqual(planEquip(items, "greatsword"), expected);
});

test("équiper une arme à une main range l'arme à deux mains portée", () => {
  const items = [
    { id: "greatsword", type: "weapon", hands: "two", worn: true },
    { id: "sword", type: "weapon", hands: "one", worn: false }
  ];
  const expected = [
    { id: "greatsword", worn: false },
    { id: "sword", worn: true }
  ];
  assert.deepEqual(planEquip(items, "sword"), expected);
});

test("deux armes à une main peuvent être portées ensemble", () => {
  const items = [
    { id: "sword", type: "weapon", hands: "one", worn: true },
    { id: "axe", type: "weapon", hands: "one", worn: false }
  ];
  const expected = [{ id: "axe", worn: true }];
  assert.deepEqual(planEquip(items, "axe"), expected);
});

test("avec épée et bouclier, une nouvelle arme à une main remplace l'épée et garde le bouclier", () => {
  const items = [
    { id: "sword", type: "weapon", hands: "one", worn: true },
    { id: "shield", type: "armor", isShield: true, worn: true },
    { id: "mace", type: "weapon", hands: "one", worn: false }
  ];
  const expected = [
    { id: "sword", worn: false },
    { id: "mace", worn: true }
  ];
  assert.deepEqual(planEquip(items, "mace"), expected);
});

test("un bouclier remplace l'objet déjà tenu en main secondaire", () => {
  const items = [
    { id: "sword", type: "weapon", hands: "one", worn: true },
    { id: "dagger", type: "weapon", hands: "off", worn: true },
    { id: "shield", type: "armor", isShield: true, worn: false }
  ];
  const expected = [
    { id: "dagger", worn: false },
    { id: "shield", worn: true }
  ];
  assert.deepEqual(planEquip(items, "shield"), expected);
});

test("avec deux armes à une main, un bouclier range la plus récente", () => {
  const items = [
    { id: "sword", type: "weapon", hands: "one", worn: true },
    { id: "axe", type: "weapon", hands: "one", worn: true },
    { id: "shield", type: "armor", isShield: true, worn: false }
  ];
  const expected = [
    { id: "axe", worn: false },
    { id: "shield", worn: true }
  ];
  assert.deepEqual(planEquip(items, "shield"), expected);
});

test("une seule armure (hors bouclier) peut être portée", () => {
  const items = [
    { id: "leather", type: "armor", isShield: false, worn: true },
    { id: "shield", type: "armor", isShield: true, worn: true },
    { id: "mail", type: "armor", isShield: false, worn: false }
  ];
  const expected = [
    { id: "leather", worn: false },
    { id: "mail", worn: true }
  ];
  assert.deepEqual(planEquip(items, "mail"), expected);
});

test("une arme sans nombre de mains renseigné compte comme une arme à une main", () => {
  const items = [
    { id: "greatsword", type: "weapon", hands: "two", worn: true },
    { id: "club", type: "weapon", hands: "", worn: false }
  ];
  const expected = [
    { id: "greatsword", worn: false },
    { id: "club", worn: true }
  ];
  assert.deepEqual(planEquip(items, "club"), expected);
});

test("équiper un objet déjà porté ne change rien", () => {
  const items = [{ id: "sword", type: "weapon", hands: "one", worn: true }];
  assert.deepEqual(planEquip(items, "sword"), []);
});

test("ranger un objet ne touche qu'à cet objet", () => {
  const items = [
    { id: "sword", type: "weapon", hands: "one", worn: true },
    { id: "shield", type: "armor", isShield: true, worn: true }
  ];
  assert.deepEqual(planUnequip(items, "sword"), [{ id: "sword", worn: false }]);
});
