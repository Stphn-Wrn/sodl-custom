import { MODULE_ID } from "../../shared/constants.js";
import { rerenderOpenApps, t } from "../../shared/foundry-adapter.js";
import { SODL_CONFIG } from "./config.js";
import { SODLDataManager } from "./data-manager.js";
import { SODLCompanionApp } from "./companion-app.js";

/**
 * Compagnon SODL : fenêtre de règles, recherche et réserve de Fortune.
 */
export const companionFeature = {
  init() {
    window.SODLDataManager = SODLDataManager;
    window.SODLCompanionApp = SODLCompanionApp;

    game.settings.register(MODULE_ID, "chancePoints", {
      scope: "world",
      config: false,
      type: Number,
      default: 0,
      onChange: () => rerenderOpenApps(SODLCompanionApp)
    });

    game.settings.register(MODULE_ID, "maxChancePoints", {
      scope: "world",
      config: false,
      type: Number,
      default: SODL_CONFIG.resources.chancePoints.maximum,
      onChange: () => rerenderOpenApps(SODLCompanionApp)
    });
  },

  getSceneControlButtons(controls) {
    controls.sodl = {
      name: "sodl",
      title: t("SODL.Companion.ControlTitle"),
      icon: "fas fa-book",
      order: 100,
      tools: {
        open: {
          name: "open",
          title: t("SODL.Companion.OpenTool"),
          icon: "fas fa-book",
          button: true,
          onChange: (event, active) => {
            if (active) {
              new SODLCompanionApp().render(true);
            }
          }
        }
      },
      activeTool: "open"
    };
  }
};
