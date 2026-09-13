import { SODLDataManager } from "./data-manager.js";
import { SODLCompanionApp } from "./sodl-app.js";

function registerModule() {
  console.log("SODL Companion | Registering module");
  
  window.SODLDataManager = SODLDataManager;
  window.SODLCompanionApp = SODLCompanionApp;
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
