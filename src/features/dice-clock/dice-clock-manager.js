import { MODULE_ID } from "../../shared/constants.js";
import { playSound } from "../../shared/foundry-adapter.js";

// Icônes Font Awesome pour les faces 1 à 6 (utilisées seulement quand le nombre
// de faces par dé est 6, pour un rendu générique au-delà on affiche un chiffre).
const DICE_ICONS = [null, "fa-dice-one", "fa-dice-two", "fa-dice-three", "fa-dice-four", "fa-dice-five", "fa-dice-six"];

/**
 * Gère l'état et la logique de la "Dice Clock" (horloge à dés).
 * Conçu pour être réutilisable : le nombre de dés, le nombre de faces par dé,
 * la durée d'un point (pip) et l'heure de départ sont tous configurables via
 * les paramètres du module
 */
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

  // Nombre de points (pips) retirés qui correspondent à une heure pleine.
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

  /**
   * Calcule la valeur affichée de chaque dé à partir du nombre de points restants.
   * Les dés se vident toujours l'un après l'autre (le premier dé descend de "faces"
   * à 0, puis le suivant, etc.), ce qui reproduit exactement la règle "on retire
   * toujours le point du dé qui a la plus petite valeur non nulle" sans avoir à
   * suivre l'état de chaque dé séparément.
   */
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
    return `${String(h).padStart(2, "0")}h00`;
  }

  static async resetClock() {
    if (!game.user.isGM) return;
    const state = { remaining: this.totalPips, hour: this.startHour };
    await this.setState(state);
    await ChatMessage.create({
      content: `
        <div class="sodl-clock-message">
          <p><strong>🕰️ L'horloge est remise à zéro.</strong></p>
          <p>Il est ${this.getHourLabel(state.hour)}. Les dés affichent leur valeur maximale.</p>
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
      console.warn("SODL Companion | Impossible de jouer le son de l'horloge", err);
    }
  }

  // Retire un unique point (pip) au "dé" le plus bas et gère les déclencheurs
  // (passage à l'heure pleine, alerte finale). Utilisé en boucle pour retirer
  // plusieurs points d'un coup (ex: repos court).
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
            <p><strong>🕰️ Ding... Dong...</strong></p>
            <p>L'horloge sonne. Il est maintenant <strong>${this.getHourLabel(state.hour)}</strong>.</p>
          </div>
        `
      });
    }

    if (state.remaining === 0) {
      const criticalMessage = game.settings.get(MODULE_ID, "diceClockCriticalMessage");
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
