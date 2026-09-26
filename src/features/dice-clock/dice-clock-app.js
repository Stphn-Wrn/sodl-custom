import { modulePath } from "../../shared/constants.js";
import { getDialogClass, t } from "../../shared/foundry-adapter.js";
import { SODLDiceClockManager } from "./dice-clock-manager.js";

/**
 * Fenêtre flottante affichant la "Dice Clock". Déplaçable par tout le monde
 * (comportement standard des fenêtres Foundry), mais seul le MJ voit les
 * boutons de contrôle : les joueurs n'ont qu'une vue en lecture seule.
 */
export class SODLDiceClockApp extends Application {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: "sodl-dice-clock-app",
      title: t("SODL.DiceClock.Title"),
      template: modulePath("src/features/dice-clock/dice-clock.html"),
      width: 260,
      height: "auto",
      resizable: false,
      minimizable: true,
      classes: ["sodl-dice-clock"]
    });
  }

  getData(options = {}) {
    const data = super.getData(options);
    const state = SODLDiceClockManager.getState();

    data.isGM = game.user.isGM;
    data.hourLabel = SODLDiceClockManager.getHourLabel(state.hour);
    data.isMidnight = state.remaining === 0;
    data.dice = SODLDiceClockManager.getDiceValues(state.remaining).map((value) => ({
      value,
      visible: value > 0,
      icon: SODLDiceClockManager.getDiceIcon(value)
    }));
    return data;
  }

  activateListeners(html) {
    super.activateListeners(html);
    if (!game.user.isGM) return;

    html.find(".dice-clock-room").on("click", () => SODLDiceClockManager.removePoints(1));
    html.find(".dice-clock-rest").on("click", () => SODLDiceClockManager.removePoints(SODLDiceClockManager.pipsPerHour));
    html.find(".dice-clock-minus").on("click", () => SODLDiceClockManager.manualAdjust(-1));
    html.find(".dice-clock-plus").on("click", () => SODLDiceClockManager.manualAdjust(1));

    html.find(".dice-clock-reset").on("click", () => {
      const DialogClass = getDialogClass();
      new DialogClass({
        title: t("SODL.DiceClock.ResetDialog.Title"),
        content: `<p>${t("SODL.DiceClock.ResetDialog.Content")}</p>`,
        buttons: {
          yes: {
            icon: '<i class="fas fa-undo"></i>',
            label: t("SODL.DiceClock.Reset"),
            callback: () => SODLDiceClockManager.resetClock()
          },
          no: {
            icon: '<i class="fas fa-times"></i>',
            label: t("SODL.Common.Cancel")
          }
        },
        default: "no"
      }).render(true);
    });
  }
}
