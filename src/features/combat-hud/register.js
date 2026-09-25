import { MODULE_ID } from "../../shared/constants.js";
import { SODLCombatHud } from "./combat-hud.js";

function isEnabled() {
  return game.settings.get(MODULE_ID, "combatHudEnabled");
}

// Réglage personnel : lié à l'utilisateur (tous ses appareils) depuis la v12,
// au navigateur en v11 où la portée « user » n'existe pas.
function personalScope() {
  if (game.release?.generation >= 12) {
    return "user";
  }
  return "client";
}

function applyEnabled(enabled) {
  if (enabled) {
    SODLCombatHud.mount();
  } else {
    SODLCombatHud.unmount();
  }
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
      hint: "Réglage personnel (chaque joueur et le MJ choisissent pour eux-mêmes). Affiche en bas de l'écran, à la place des macros et de la liste des joueurs, un HUD pour le token contrôlé (attaques, équipement, sorts, talents, objets, caractéristiques). Un bouton permet de revenir aux macros.",
      scope: personalScope(),
      config: true,
      type: Boolean,
      default: true,
      onChange: applyEnabled
    });

    game.settings.register(MODULE_ID, "combatHudConfirmRolls", {
      name: "HUD de combat : confirmer les jets",
      hint: "Réglage personnel. Affiche la fenêtre de jet du système (déjà remplie avec les faveurs/fléaux et le modificateur du HUD) pour pouvoir annuler, au lieu de lancer directement.",
      scope: personalScope(),
      config: true,
      type: Boolean,
      default: false
    });

    game.keybindings.register(MODULE_ID, "combatHudToggle", {
      name: "HUD de combat : basculer HUD / macros",
      hint: "Alterne entre le HUD de combat et la barre de macros avec la liste des joueurs.",
      editable: [],
      onDown: () => {
        if (!isEnabled()) {
          return false;
        }
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

  // Les hooks sont posés dans tous les cas : ils ne font rien tant que le HUD
  // n'est pas monté, ce qui permet de l'activer en cours de partie.
  ready() {
    applyEnabled(isEnabled());

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
    Hooks.on("renderDialogV2", (app, element) => SODLCombatHud.onDialogRendered(element));
    window.addEventListener("resize", () => SODLCombatHud.onViewportChanged());
  }
};
