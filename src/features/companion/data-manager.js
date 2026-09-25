export class SODLDataManager {
  static getChancePoints() {
    return game.settings.get("sodl-companion", "chancePoints");
  }

  static async setChancePoints(value) {
    if (!game.user.isGM) return false;

    const max = this.getMaxChancePoints();
    const clamped = Math.min(max, Math.max(0, value));
    await game.settings.set("sodl-companion", "chancePoints", clamped);
    return true;
  }

  static async modifyChancePoints(delta) {
    const current = this.getChancePoints();
    return this.setChancePoints(current + delta);
  }

  static getMaxChancePoints() {
    return game.settings.get("sodl-companion", "maxChancePoints");
  }

  static async setMaxChancePoints(value) {
    if (!game.user.isGM) return false;
    if (!Number.isFinite(value) || value < 0) return false;

    await game.settings.set("sodl-companion", "maxChancePoints", value);

    const current = this.getChancePoints();
    if (current > value) {
      await game.settings.set("sodl-companion", "chancePoints", value);
    }

    return true;
  }
}
