export class SODLDataManager {
  static async getChancePoints(actor = null) {
    if (!actor) {
      actor = game.user.character;
    }
    return actor?.getFlag("sodl-companion", "chancePoints") || 0;
  }
  
  static async setChancePoints(value, actor = null) {
    if (!actor) {
      actor = game.user.character;
    }
    if (!actor) return false;
    
    if (!game.user.isGM) return false;
    
    await actor.setFlag("sodl-companion", "chancePoints", Math.max(0, value));
    return true;
  }
  
  static async modifyChancePoints(delta, actor = null) {
    if (!actor) {
      actor = game.user.character;
    }
    if (!actor) return false;
    
    const current = await this.getChancePoints(actor);
    return this.setChancePoints(current + delta, actor);
  }
}
