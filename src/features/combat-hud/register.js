import { MODULE_ID } from "../../shared/constants.js";
import { SODLCombatHud } from "./combat-hud.js";

function isEnabled() {
  return game.settings.get(MODULE_ID, "combatHudEnabled");
}

function onItemChanged(item) {
  SODLCombatHud.onDocumentChanged(item.parent);
}

// Un effet peut appartenir à l'acteur ou à l'un de ses objets.
function onEffectChanged(effect) {
  let owner = effect.parent;
  if (owner?.documentName === "Item") {
    owner = owner.parent;
  }
  SODLCombatHud.onDocumentChanged(owner);
}

/**
 * HUD de combat : barre en bas de l'écran reprenant armes, équipement, sorts,
 * talents, consommables et caractéristiques du token contrôlé.
 */
export const combatHudFeature = {
  init() {
    window.SODLCombatHud = SODLCombatHud;

    game.settings.register(MODULE_ID, "combatHudEnabled", {
      name: "HUD de combat : activer",
      hint: "Affiche en bas de l'écran une barre d'actions pour le token contrôlé (attaques, équipement, sorts, talents, objets, caractéristiques). Nécessite de rafraîchir la partie.",
      scope: "client",
      config: true,
      type: Boolean,
      default: true,
      requiresReload: true
    });

    // Onglet ouvert et état réduit, propres à chaque client.
    game.settings.register(MODULE_ID, "combatHudLayout", {
      scope: "client",
      config: false,
      type: Object,
      default: {}
    });
  },

  ready() {
    if (!isEnabled()) {
      return;
    }
    SODLCombatHud.mount();

    Hooks.on("controlToken", () => SODLCombatHud.onTokenControlChanged());
    Hooks.on("canvasReady", () => SODLCombatHud.onTokenControlChanged());
    Hooks.on("updateActor", (actor) => SODLCombatHud.onDocumentChanged(actor));
    Hooks.on("createItem", onItemChanged);
    Hooks.on("updateItem", onItemChanged);
    Hooks.on("deleteItem", onItemChanged);
    Hooks.on("createActiveEffect", onEffectChanged);
    Hooks.on("updateActiveEffect", onEffectChanged);
    Hooks.on("deleteActiveEffect", onEffectChanged);
  }
};
