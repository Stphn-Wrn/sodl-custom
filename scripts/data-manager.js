export class SODLDataManager {
  static getChancePoints() {
    return game.settings.get("sodl-companion", "chancePoints");
  }

  static async setChancePoints(value) {
    if (!game.user.isGM) return false;

    await game.settings.set("sodl-companion", "chancePoints", Math.max(0, value));
    return true;
  }

  static async modifyChancePoints(delta) {
    const current = this.getChancePoints();
    return this.setChancePoints(current + delta);
  }
}
