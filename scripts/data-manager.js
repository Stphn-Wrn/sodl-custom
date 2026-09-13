import { SODL_CONFIG } from "./config.js";

export class SODLDataManager {
  static getChancePoints() {
    return game.settings.get("sodl-companion", "chancePoints");
  }

  static async setChancePoints(value) {
    if (!game.user.isGM) return false;

    const max = SODL_CONFIG.resources.chancePoints.maximum;
    const clamped = Math.min(max, Math.max(0, value));
    await game.settings.set("sodl-companion", "chancePoints", clamped);
    return true;
  }

  static async modifyChancePoints(delta) {
    const current = this.getChancePoints();
    return this.setChancePoints(current + delta);
  }
}
