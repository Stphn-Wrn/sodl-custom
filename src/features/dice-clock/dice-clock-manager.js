import { MODULE_ID } from "../../shared/constants.js";
import { playSound, t } from "../../shared/foundry-adapter.js";

// Seulement pour des d6 : au-delà, on affiche un chiffre.
const DICE_ICONS = [null, "fa-dice-one", "fa-dice-two", "fa-dice-three", "fa-dice-four", "fa-dice-five", "fa-dice-six"];

export class SODLDiceClockManager {
  static get diceCount() {
    return game.settings.get(MODULE_ID, "diceClockDiceCount");
  }

  static get faces() {
    return game.settings.get(MODULE_ID, "diceClockFaces");
  }

  static get pipMinutes() {
    return game.settings.get(MODULE_ID, "diceClockPipMinutes");
  }

  static get startHour() {
    return game.settings.get(MODULE_ID, "diceClockStartHour");
  }

  static get pipsPerHour() {
    return Math.max(1, Math.round(60 / this.pipMinutes));
  }

  static get totalPips() {
    return this.diceCount * this.faces;
  }

  static getState() {
    return foundry.utils.deepClone(game.settings.get(MODULE_ID, "diceClockState"));
  }

  static async setState(state) {
    await game.settings.set(MODULE_ID, "diceClockState", state);
  }

  // Vider les dés l'un après l'autre revient à toujours retirer le point du dé
  // le plus bas, sans avoir à stocker l'état de chaque dé.
  static getDiceValues(remaining) {
    const diceCount = this.diceCount;
    const faces = this.faces;
    const clamp = (v) => Math.max(0, Math.min(faces, v));
    const dice = [];
    for (let i = 0; i < diceCount; i++) {
      const offset = faces * (diceCount - 1 - i);
      dice.push(clamp(remaining - offset));
    }
    return dice;
  }

  static getDiceIcon(value) {
    if (this.faces === 6 && value >= 1 && value <= 6) return DICE_ICONS[value];
    return null;
  }

  static getHourLabel(hour) {
    const h = ((Math.round(hour) % 24) + 24) % 24;
    return t("SODL.DiceClock.HourFormat", { hour: String(h).padStart(2, "0") });
  }

  static async resetClock() {
    if (!game.user.isGM) return;
    const state = { remaining: this.totalPips, hour: this.startHour };
    await this.setState(state);
    await ChatMessage.create({
      content: `
        <div class="sodl-clock-message">
          <p><strong>🕰️ ${t("SODL.DiceClock.Chat.ResetTitle")}</strong></p>
          <p>${t("SODL.DiceClock.Chat.ResetBody", { hour: this.getHourLabel(state.hour) })}</p>
        </div>
      `
    });
  }

  static async _playChime() {
    const soundPath = game.settings.get(MODULE_ID, "diceClockSoundPath");
    if (!soundPath) return;
    try {
      await playSound({ src: soundPath, volume: 0.8, autoplay: true, loop: false });
    } catch (err) {
      console.warn("SODL Companion | Could not play the clock chime", err);
    }
  }

  static async _removeOnePoint(state) {
    if (state.remaining <= 0) return state;

    state.remaining -= 1;

    const pipsPerHour = this.pipsPerHour;
    if (state.remaining % pipsPerHour === 0) {
      state.hour += 1;
      await this._playChime();
      await ChatMessage.create({
        content: `
          <div class="sodl-clock-message">
            <p><strong>🕰️ ${t("SODL.DiceClock.Chat.ChimeTitle")}</strong></p>
            <p>${t("SODL.DiceClock.Chat.ChimeBody", { hour: `<strong>${this.getHourLabel(state.hour)}</strong>` })}</p>
          </div>
        `
      });
    }

    if (state.remaining === 0) {
      const criticalMessage = t(game.settings.get(MODULE_ID, "diceClockCriticalMessage"));
      await ChatMessage.create({
        content: `
          <div class="sodl-clock-message sodl-clock-critical">
            <p><strong>⚠️ ${this.getHourLabel(state.hour)} ⚠️</strong></p>
            <p>${criticalMessage}</p>
          </div>
        `
      });
    }

    return state;
  }

  static async removePoints(amount) {
    if (!game.user.isGM) return;
    let state = this.getState();
    for (let i = 0; i < amount; i++) {
      state = await this._removeOnePoint(state);
    }
    await this.setState(state);
  }

  static async manualAdjust(delta) {
    if (!game.user.isGM) return;
    if (delta < 0) {
      await this.removePoints(1);
      return;
    }
    if (delta > 0) {
      const state = this.getState();
      state.remaining = Math.min(this.totalPips, state.remaining + 1);
      await this.setState(state);
    }
  }
}
