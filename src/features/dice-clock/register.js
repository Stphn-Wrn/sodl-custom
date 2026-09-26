import { MODULE_ID } from "../../shared/constants.js";
import { rerenderOpenApps, t } from "../../shared/foundry-adapter.js";
import { SODLDiceClockManager } from "./dice-clock-manager.js";
import { SODLDiceClockApp } from "./dice-clock-app.js";

function isEnabled() {
  return game.settings.get(MODULE_ID, "diceClockEnabled");
}

export const diceClockFeature = {
  init() {
    window.SODLDiceClockManager = SODLDiceClockManager;
    window.SODLDiceClockApp = SODLDiceClockApp;

    game.settings.register(MODULE_ID, "diceClockEnabled", {
      name: "SODL.Settings.DiceClockEnabled.Name",
      hint: "SODL.Settings.DiceClockEnabled.Hint",
      scope: "world",
      config: true,
      type: Boolean,
      default: true,
      requiresReload: true
    });

    game.settings.register(MODULE_ID, "diceClockDiceCount", {
      name: "SODL.Settings.DiceClockDiceCount.Name",
      hint: "SODL.Settings.DiceClockDiceCount.Hint",
      scope: "world",
      config: true,
      type: Number,
      default: 3,
      range: { min: 1, max: 8, step: 1 },
      onChange: () => SODLDiceClockManager.resetClock()
    });

    game.settings.register(MODULE_ID, "diceClockFaces", {
      name: "SODL.Settings.DiceClockFaces.Name",
      hint: "SODL.Settings.DiceClockFaces.Hint",
      scope: "world",
      config: true,
      type: Number,
      default: 6,
      range: { min: 2, max: 20, step: 1 },
      onChange: () => SODLDiceClockManager.resetClock()
    });

    game.settings.register(MODULE_ID, "diceClockPipMinutes", {
      name: "SODL.Settings.DiceClockPipMinutes.Name",
      hint: "SODL.Settings.DiceClockPipMinutes.Hint",
      scope: "world",
      config: true,
      type: Number,
      default: 20,
      range: { min: 1, max: 120, step: 1 }
    });

    game.settings.register(MODULE_ID, "diceClockStartHour", {
      name: "SODL.Settings.DiceClockStartHour.Name",
      hint: "SODL.Settings.DiceClockStartHour.Hint",
      scope: "world",
      config: true,
      type: Number,
      default: 18,
      range: { min: 0, max: 23, step: 1 },
      onChange: () => SODLDiceClockManager.resetClock()
    });

    game.settings.register(MODULE_ID, "diceClockSoundPath", {
      name: "SODL.Settings.DiceClockSoundPath.Name",
      hint: "SODL.Settings.DiceClockSoundPath.Hint",
      scope: "world",
      config: true,
      type: String,
      default: "modules/sodl-companion/sounds/vecna-clock.mp3",
      filePicker: "audio",
      onChange: () => rerenderOpenApps(SODLDiceClockApp)
    });

    game.settings.register(MODULE_ID, "diceClockCriticalMessage", {
      name: "SODL.Settings.DiceClockCriticalMessage.Name",
      hint: "SODL.Settings.DiceClockCriticalMessage.Hint",
      scope: "world",
      config: true,
      type: String,
      default: "SODL.DiceClock.DefaultCriticalMessage"
    });

    game.settings.register(MODULE_ID, "diceClockState", {
      scope: "world",
      config: false,
      type: Object,
      default: { remaining: 18, hour: 18 },
      onChange: () => rerenderOpenApps(SODLDiceClockApp)
    });
  },

  getSceneControlButtons(controls) {
    if (!isEnabled()) {
      return;
    }
    controls.sodlDiceClock = {
      name: "sodlDiceClock",
      title: t("SODL.DiceClock.Title"),
      icon: "fas fa-dice-six",
      order: 101,
      tools: {
        open: {
          name: "open",
          title: t("SODL.DiceClock.OpenTool"),
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
