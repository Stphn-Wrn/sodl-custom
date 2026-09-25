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
 * HUD de combat : occupe le bas de l'écran à la place de la barre de macros et
 * de la liste des joueurs (bascule par bouton ou raccourci), et reprend armes,
 * équipement, sorts, talents, consommables et caractéristiques du token contrôlé.
 */
export const combatHudFeature = {
  init() {
    window.SODLCombatHud = SODLCombatHud;

    game.settings.register(MODULE_ID, "combatHudEnabled", {
      name: "HUD de combat : activer",
      hint: "Affiche en bas de l'écran, à la place des macros et de la liste des joueurs, un HUD pour le token contrôlé (attaques, équipement, sorts, talents, objets, caractéristiques). Un bouton permet de revenir aux macros. Nécessite de rafraîchir la partie.",
      scope: "client",
      config: true,
      type: Boolean,
      default: true,
      requiresReload: true
    });

    game.keybindings.register(MODULE_ID, "combatHudToggle", {
      name: "HUD de combat : basculer HUD / macros",
      hint: "Alterne entre le HUD de combat et la barre de macros avec la liste des joueurs.",
      editable: [],
      onDown: () => {
        SODLCombatHud.toggleMode();
        return true;
      }
    });

    // Onglet ouvert, mode affiché et hauteur des actions, propres à chaque client.
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
    Hooks.on("collapseSidebar", () => SODLCombatHud.onViewportChanged());
    window.addEventListener("resize", () => SODLCombatHud.onViewportChanged());
  }
};
