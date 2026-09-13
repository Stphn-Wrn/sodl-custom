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

Hooks.once("ready", () => {
  console.log("SODL Companion | Ready");
  
  if (game.user.isGM || true) {
    addSODLAppButton();
  }
});

function addSODLAppButton() {
  const button = $(`
    <div id="sodl-app-button" class="sodl-button">
      <i class="fas fa-book"></i> SODL
    </div>
  `);
  
  button.on("click", () => {
    new SODLCompanionApp().render(true);
  });
  
  $("#ui-top").append(button);
}
