import { MODULE_ID } from "../../shared/constants.js";
import { rerenderOpenApps, t } from "../../shared/foundry-adapter.js";
import { SODLPartyDashboard } from "./party-dashboard-app.js";

const FORTUNE_SETTINGS = [`${MODULE_ID}.chancePoints`, `${MODULE_ID}.maxChancePoints`];

function refresh() {
  rerenderOpenApps(SODLPartyDashboard);
}

function refreshFor(actor) {
  if (SODLPartyDashboard.isPartyActor(actor)) {
    refresh();
  }
}

const SYSTEM_GM_TOOLS = "sotdl";

function hideSystemGmTools(controls) {
  if (!game.settings.get(MODULE_ID, "hideSystemGmTools")) {
    return;
  }
  if (Array.isArray(controls)) {
    const index = controls.findIndex((control) => control.name === SYSTEM_GM_TOOLS);
    if (index >= 0) {
      controls.splice(index, 1);
    }
    return;
  }
  delete controls[SYSTEM_GM_TOOLS];
}

function ownerActor(document) {
  let owner = document.parent;
  if (owner?.documentName === "Item") {
    owner = owner.parent;
  }
  return owner;
}

export const partyDashboardFeature = {
  init() {
    window.SODLPartyDashboard = SODLPartyDashboard;

    game.settings.register(MODULE_ID, "hideSystemGmTools", {
      name: "SODL.Settings.HideSystemGmTools.Name",
      hint: "SODL.Settings.HideSystemGmTools.Hint",
      scope: "world",
      config: true,
      type: Boolean,
      default: true,
      requiresReload: true
    });
  },

  ready() {
    if (!game.user.isGM) {
      return;
    }
    Hooks.on("updateActor", refreshFor);
    Hooks.on("createActiveEffect", (effect) => refreshFor(ownerActor(effect)));
    Hooks.on("updateActiveEffect", (effect) => refreshFor(ownerActor(effect)));
    Hooks.on("deleteActiveEffect", (effect) => refreshFor(ownerActor(effect)));
    Hooks.on("updateSetting", (setting) => {
      if (FORTUNE_SETTINGS.includes(setting.key)) {
        refresh();
      }
    });
  },

  getSceneControlButtons(controls) {
    if (!game.user.isGM) {
      return;
    }
    hideSystemGmTools(controls);
    controls.sodlParty = {
      name: "sodlParty",
      title: t("SODL.Dashboard.Title"),
      icon: "fas fa-users",
      order: 102,
      tools: {
        open: {
          name: "open",
          title: t("SODL.Dashboard.OpenTool"),
          icon: "fas fa-users",
          button: true,
          onChange: (event, active) => {
            if (active) {
              new SODLPartyDashboard().render(true);
            }
          }
        }
      },
      activeTool: "open"
    };
  }
};
