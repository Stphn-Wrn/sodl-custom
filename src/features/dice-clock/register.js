import { MODULE_ID } from "../../shared/constants.js";
import { rerenderOpenApps } from "../../shared/foundry-adapter.js";
import { SODLDiceClockManager } from "./dice-clock-manager.js";
import { SODLDiceClockApp } from "./dice-clock-app.js";

function isEnabled() {
  return game.settings.get(MODULE_ID, "diceClockEnabled");
}

/**
 * Horloge à Dés : compte à rebours à base de dés, piloté par le MJ.
 * Les paramètres la rendent réutilisable pour d'autres scènes chronométrées.
 */
export const diceClockFeature = {
  init() {
    window.SODLDiceClockManager = SODLDiceClockManager;
    window.SODLDiceClockApp = SODLDiceClockApp;

    game.settings.register(MODULE_ID, "diceClockEnabled", {
      name: "Horloge à Dés : activer le module",
      hint: "Active ou désactive le bouton et la fenêtre de l'Horloge à Dés. Nécessite de rouvrir/rafraîchir la partie pour que le bouton apparaisse ou disparaisse.",
      scope: "world",
      config: true,
      type: Boolean,
      default: true,
      requiresReload: true
    });

    game.settings.register(MODULE_ID, "diceClockDiceCount", {
      name: "Horloge à Dés : nombre de dés",
      hint: "Nombre de dés utilisés par l'horloge.",
      scope: "world",
      config: true,
      type: Number,
      default: 3,
      range: { min: 1, max: 8, step: 1 },
      onChange: () => SODLDiceClockManager.resetClock()
    });

    game.settings.register(MODULE_ID, "diceClockFaces", {
      name: "Horloge à Dés : faces par dé",
      hint: "Nombre de faces de chaque dé (6 pour des d6).",
      scope: "world",
      config: true,
      type: Number,
      default: 6,
      range: { min: 2, max: 20, step: 1 },
      onChange: () => SODLDiceClockManager.resetClock()
    });

    game.settings.register(MODULE_ID, "diceClockPipMinutes", {
      name: "Horloge à Dés : minutes par point",
      hint: "Durée en minutes représentée par un point (pip) retiré.",
      scope: "world",
      config: true,
      type: Number,
      default: 20,
      range: { min: 1, max: 120, step: 1 }
    });

    game.settings.register(MODULE_ID, "diceClockStartHour", {
      name: "Horloge à Dés : heure de départ",
      hint: "Heure affichée au début du compte à rebours (18 pour 18h00).",
      scope: "world",
      config: true,
      type: Number,
      default: 18,
      range: { min: 0, max: 23, step: 1 },
      onChange: () => SODLDiceClockManager.resetClock()
    });

    game.settings.register(MODULE_ID, "diceClockSoundPath", {
      name: "Horloge à Dés : son du carillon",
      hint: "Chemin vers le fichier audio joué à chaque heure pleine (ex: modules/sodl-companion/sounds/carillon.mp3). Laisser vide pour désactiver le son.",
      scope: "world",
      config: true,
      type: String,
      default: "modules/sodl-companion/sounds/vecna-clock.mp3",
      filePicker: "audio",
      onChange: () => rerenderOpenApps(SODLDiceClockApp)
    });

    game.settings.register(MODULE_ID, "diceClockCriticalMessage", {
      name: "Horloge à Dés : message final",
      hint: "Message envoyé dans le chat lorsque tous les points de l'horloge sont épuisés.",
      scope: "world",
      config: true,
      type: String,
      default: "Un grondement sourd s'élève des murs de la maison... Le Monticule de Chair (Walter) s'éveille et attaque !"
    });

    game.settings.register(MODULE_ID, "diceClockState", {
      scope: "world",
      config: false,
      type: Object,
      default: { remaining: 18, hour: 18 },
      onChange: () => rerenderOpenApps(SODLDiceClockApp)
    });
  },

  // Bouton séparé (visible par tous), seulement si l'horloge est activée.
  getSceneControlButtons(controls) {
    if (!isEnabled()) {
      return;
    }
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
            if (active) {
              new SODLDiceClockApp().render(true);
            }
          }
        }
      },
      activeTool: "open"
    };
  }
};
