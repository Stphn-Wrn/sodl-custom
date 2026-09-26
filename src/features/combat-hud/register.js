import { MODULE_ID } from "../../shared/constants.js";
import { SODLCombatHud } from "./combat-hud.js";

function isEnabled() {
  return game.settings.get(MODULE_ID, "combatHudEnabled");
}

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

function onEffectChanged(effect) {
  let owner = effect.parent;
  if (owner?.documentName === "Item") {
    owner = owner.parent;
  }
  SODLCombatHud.onDocumentChanged(owner);
}

export const combatHudFeature = {
  init() {
    window.SODLCombatHud = SODLCombatHud;

    game.settings.register(MODULE_ID, "combatHudEnabled", {
      name: "SODL.Settings.CombatHudEnabled.Name",
      hint: "SODL.Settings.CombatHudEnabled.Hint",
      scope: personalScope(),
      config: true,
      type: Boolean,
      default: true,
      onChange: applyEnabled
    });

    game.keybindings.register(MODULE_ID, "combatHudToggle", {
      name: "SODL.Settings.CombatHudToggle.Name",
      hint: "SODL.Settings.CombatHudToggle.Hint",
      editable: [],
      onDown: () => {
        if (!isEnabled()) {
          return false;
        }
        SODLCombatHud.toggleMode();
        return true;
      }
    });

    game.settings.register(MODULE_ID, "combatHudLayout", {
      scope: "client",
      config: false,
      type: Object,
      default: {}
    });
  },

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
    Hooks.on("updateSetting", (setting) => {
      if ([`${MODULE_ID}.chancePoints`, `${MODULE_ID}.maxChancePoints`].includes(setting.key)) {
        SODLCombatHud.onFortuneChanged();
      }
    });
    Hooks.on("collapseSidebar", () => SODLCombatHud.onViewportChanged());
    Hooks.on("renderDialogV2", (app, element) => SODLCombatHud.onDialogRendered(element));
    window.addEventListener("resize", () => SODLCombatHud.onViewportChanged());
  }
};
