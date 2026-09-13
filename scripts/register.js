import { SODL_CONFIG } from "./config.js";
import { SODLDataManager } from "./data-manager.js";
import { SODLCompanionApp } from "./sodl-app.js";

function registerModule() {
  console.log("SODL Companion | Registering module");

  window.SODLDataManager = SODLDataManager;
  window.SODLCompanionApp = SODLCompanionApp;

  const rerenderOpenApps = () => {
    for (const app of Object.values(ui.windows)) {
      if (app instanceof SODLCompanionApp) app.render(false);
    }
  };

  game.settings.register("sodl-companion", "chancePoints", {
    scope: "world",
    config: false,
    type: Number,
    default: 0,
    onChange: rerenderOpenApps
  });

  game.settings.register("sodl-companion", "maxChancePoints", {
    scope: "world",
    config: false,
    type: Number,
    default: SODL_CONFIG.resources.chancePoints.maximum,
    onChange: rerenderOpenApps
  });
}

Hooks.once("init", () => {
  console.log("SODL Companion | Initializing");
  registerModule();
});

Hooks.on("getSceneControlButtons", (controls) => {
  controls.sodl = {
    name: "sodl",
    title: "SODL Companion",
    icon: "fas fa-book",
    order: 100,
    tools: {
      open: {
        name: "open",
        title: "Ouvrir le Compagnon SODL",
        icon: "fas fa-book",
        button: true,
        onChange: () => {
          new SODLCompanionApp().render(true);
        }
      }
    },
    activeTool: "open"
  };
});
