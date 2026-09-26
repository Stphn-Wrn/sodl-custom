import { test } from "node:test";
import assert from "node:assert/strict";
import { createTranslator, localizeTree } from "../../src/shared/i18n.js";

test("une clé est cherchée dans le dictionnaire imbriqué", () => {
  const t = createTranslator({ SODL: { Hud: { Attacks: "Attaques" } } });
  assert.equal(t("SODL.Hud.Attacks"), "Attaques");
});

test("les variables entre accolades sont remplacées", () => {
  const t = createTranslator({ SODL: { Stowed: "Rangé : {items}" } });
  assert.equal(t("SODL.Stowed", { items: "Épée" }), "Rangé : Épée");
});

test("une clé absente est renvoyée telle quelle, comme dans Foundry", () => {
  const t = createTranslator({});
  assert.equal(t("SODL.Missing"), "SODL.Missing");
});

test("un arbre de configuration voit ses clés traduites, le reste est conservé", () => {
  const t = createTranslator({ SODL: { Rules: { Prone: "À terre" } } });
  const tree = { list: [{ id: "prone", name: "SODL.Rules.Prone", max: 6 }], rows: [["—", 1]] };
  const expected = { list: [{ id: "prone", name: "À terre", max: 6 }], rows: [["—", 1]] };
  assert.deepEqual(localizeTree(tree, t), expected);
});
