import { SODLDiceClockManager } from "./dice-clock-data.js";

/**
 * Fenêtre flottante affichant la "Dice Clock". Déplaçable par tout le monde
 * (comportement standard des fenêtres Foundry), mais seul le MJ voit les
 * boutons de contrôle : les joueurs n'ont qu'une vue en lecture seule.
 */
export class SODLDiceClockApp extends Application {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: "sodl-dice-clock-app",
      title: "Horloge à Dés",
      template: "modules/sodl-companion/templates/dice-clock.html",
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
      const DialogClass = foundry?.appv1?.api?.Dialog ?? globalThis.Dialog;
      new DialogClass({
        title: "Réinitialiser l'horloge",
        content: "<p>Remettre l'horloge à son état de départ ?</p>",
        buttons: {
          yes: {
            icon: '<i class="fas fa-undo"></i>',
            label: "Réinitialiser",
            callback: () => SODLDiceClockManager.resetClock()
          },
          no: {
            icon: '<i class="fas fa-times"></i>',
            label: "Annuler"
          }
        },
        default: "no"
      }).render(true);
    });
  }
}
