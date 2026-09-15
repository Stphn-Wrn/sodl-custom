import { SODL_CONFIG } from "./config.js";
import { SODLDataManager } from "./data-manager.js";
import { SODLCompanionApp } from "./sodl-app.js";
import { SODLDiceClockManager } from "./dice-clock-data.js";
import { SODLDiceClockApp } from "./dice-clock-app.js";

function registerModule() {
  console.log("SODL Companion | Registering module");

  window.SODLDataManager = SODLDataManager;
  window.SODLCompanionApp = SODLCompanionApp;
  window.SODLDiceClockManager = SODLDiceClockManager;
  window.SODLDiceClockApp = SODLDiceClockApp;

  const rerenderOpenApps = () => {
    for (const app of Object.values(ui.windows)) {
      if (app instanceof SODLCompanionApp) app.render(false);
    }
  };

  const rerenderDiceClockApps = () => {
    for (const app of Object.values(ui.windows)) {
      if (app instanceof SODLDiceClockApp) app.render(false);
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

  // -------- Horloge à Dés (Dice Clock) --------
  // Paramètres de configuration : rendent le "chronomètre à dés" réutilisable
  // pour d'autres scènes chronométrées
  game.settings.register("sodl-companion", "diceClockEnabled", {
    name: "Horloge à Dés : activer le module",
    hint: "Active ou désactive le bouton et la fenêtre de l'Horloge à Dés. Nécessite de rouvrir/rafraîchir la partie pour que le bouton apparaisse ou disparaisse.",
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
    requiresReload: true
  });

  game.settings.register("sodl-companion", "diceClockDiceCount", {
    name: "Horloge à Dés : nombre de dés",
    hint: "Nombre de dés utilisés par l'horloge.",
    scope: "world",
    config: true,
    type: Number,
    default: 3,
    range: { min: 1, max: 8, step: 1 },
    onChange: () => SODLDiceClockManager.resetClock()
  });

  game.settings.register("sodl-companion", "diceClockFaces", {
    name: "Horloge à Dés : faces par dé",
    hint: "Nombre de faces de chaque dé (6 pour des d6).",
    scope: "world",
    config: true,
    type: Number,
    default: 6,
    range: { min: 2, max: 20, step: 1 },
    onChange: () => SODLDiceClockManager.resetClock()
  });

  game.settings.register("sodl-companion", "diceClockPipMinutes", {
    name: "Horloge à Dés : minutes par point",
    hint: "Durée en minutes représentée par un point (pip) retiré.",
    scope: "world",
    config: true,
    type: Number,
    default: 20,
    range: { min: 1, max: 120, step: 1 }
  });

  game.settings.register("sodl-companion", "diceClockStartHour", {
    name: "Horloge à Dés : heure de départ",
    hint: "Heure affichée au début du compte à rebours (18 pour 18h00).",
    scope: "world",
    config: true,
    type: Number,
    default: 18,
    range: { min: 0, max: 23, step: 1 },
    onChange: () => SODLDiceClockManager.resetClock()
  });

  game.settings.register("sodl-companion", "diceClockSoundPath", {
    name: "Horloge à Dés : son du carillon",
    hint: "Chemin vers le fichier audio joué à chaque heure pleine (ex: modules/sodl-companion/sounds/carillon.mp3). Laisser vide pour désactiver le son.",
    scope: "world",
    config: true,
    type: String,
    default: "modules/sodl-companion/sounds/vecna-clock.mp3",
    filePicker: "audio",
    onChange: rerenderDiceClockApps
  });

  game.settings.register("sodl-companion", "diceClockCriticalMessage", {
    name: "Horloge à Dés : message final",
    hint: "Message envoyé dans le chat lorsque tous les points de l'horloge sont épuisés.",
    scope: "world",
    config: true,
    type: String,
    default: "Un grondement sourd s'élève des murs de la maison... Le Monticule de Chair (Walter) s'éveille et attaque !"
  });

  game.settings.register("sodl-companion", "diceClockState", {
    scope: "world",
    config: false,
    type: Object,
    default: { remaining: 18, hour: 18 },
    onChange: rerenderDiceClockApps
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
        onChange: (event, active) => {
          if (active) new SODLCompanionApp().render(true);
        }
      }
    },
    activeTool: "open"
  };

  // Bouton séparé (visible par tous) pour ouvrir l'Horloge à Dés.
  // N'apparaît que si le module est activé dans les paramètres.
  if (game.settings.get("sodl-companion", "diceClockEnabled")) {
    controls.sodlDiceClock = {
      name: "sodlDiceClock",
      title: "Horloge à Dés",
      icon: "fas fa-dice-six",
      order: 101,
      tools: {
        open: {
          name: "open",
          title: "Ouvrir l'Horloge à Dés",
          icon: "fas fa-dice-six",
          button: true,
          onChange: (event, active) => {
            if (active) new SODLDiceClockApp().render(true);
          }
        }
      },
      activeTool: "open"
    };
  }
});
