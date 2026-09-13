/**
 * L'Ombre du Seigneur Démon - Companion Module
 * Main entry point
 */

Hooks.once("init", () => {
  console.log("SODL Companion | Initializing module");
});

Hooks.once("ready", () => {
  console.log("SODL Companion | Ready");
  
  // Ajouter un bouton au UI pour ouvrir l'app
  if (game.user.isGM || true) { // Accessible à tous
    addSODLAppButton();
  }
});

/**
 * Ajoute le bouton pour ouvrir l'application
 */
function addSODLAppButton() {
  const button = $(`
    <div id="sodl-app-button" class="sodl-button">
      <i class="fas fa-book"></i> SODL
    </div>
  `);
  
  button.on("click", () => {
    new SODLCompanionApp().render(true);
  });
  
  $("#ui-top").append(button);
}

/**
 * Gestionnaire global pour les données du module
 */
class SODLDataManager {
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
    
    // Seul le MJ peut modifier
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

// Exporter le gestionnaire
window.SODLDataManager = SODLDataManager;
