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
