import { MODULE_ID } from "../../shared/constants.js";
import * as Broadcast from "./broadcast.js";

const BROADCAST_SETTING_KEY = "youtubeBroadcast";

export class SODLYoutubeBroadcast {
  static now() {
    return game.time.serverTime;
  }

  static getState() {
    const stored = game.settings.get(MODULE_ID, BROADCAST_SETTING_KEY);
    return foundry.utils.mergeObject(Broadcast.createIdleBroadcast(), foundry.utils.deepClone(stored ?? {}));
  }

  static expectedPosition(state = this.getState()) {
    return Broadcast.expectedPosition(state, this.now());
  }

  static async _setState(state) {
    if (!game.user.isGM) {
      return;
    }
    await game.settings.set(MODULE_ID, BROADCAST_SETTING_KEY, state);
  }

  static start(video) {
    return this._setState(Broadcast.startBroadcast(video, this.now()));
  }

  static stop() {
    return this._setState(Broadcast.createIdleBroadcast());
  }

  // Appelé depuis le lecteur du MJ : ne diffuse que si l'état a réellement changé,
  // pour éviter d'écrire le paramètre en boucle.
  static report(playback) {
    const state = this.getState();
    if (!Broadcast.hasDiverged(state, playback, this.now())) {
      return;
    }
    return this._setState(Broadcast.updatePlayback(state, playback, this.now()));
  }
}
