/**
 * L'Ombre du Seigneur Démon - Companion Application
 * Gestion des onglets et interface utilisateur
 */

class SODLCompanionApp extends FormApplication {
  constructor(options = {}) {
    super({}, options);
    this.activeTab = "resources";
  }
  
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      title: "L'Ombre du Seigneur Démon - Compagnon",
      id: "sodl-companion-app",
      template: "modules/sodl-companion/templates/sodl-app.html",
      width: 800,
      height: 600,
      resizable: true,
      minimizable: true,
      classes: ["sodl-app"]
    });
  }
  
  /**
   * Données pour le template
   */
  async getData(options = {}) {
    const data = await super.getData(options);
    const actor = game.user.character;
    
    data.isGM = game.user.isGM;
    data.canEdit = game.user.isGM; // Seul le MJ peut éditer
    data.activeTab = this.activeTab;
    
    // Données des onglets
    data.tabs = {
      resources: await this.getResourcesData(actor),
      rules: await this.getRulesData(),
      actions: await this.getActionsData(),
      help: await this.getHelpData()
    };
    
    return data;
  }
  
  /**
   * Onglet: Gestion des ressources (Points de Chance)
   */
  async getResourcesData(actor) {
    const chancePoints = actor ? 
      await SODLDataManager.getChancePoints(actor) : 0;
    
    return {
      character: actor?.name || "Pas de personnage sélectionné",
      characterId: actor?.id || null,
      chancePoints: chancePoints,
      maxChancePoints: 6 // À adapter selon vos règles
    };
  }
  
  /**
   * Onglet: Aide de Jeu - Règles de base
   */
  async getRulesData() {
    return {
      sections: [
        {
          title: "Résumé des Afflictions",
          content: `
            <ul class="sodl-rules-list">
              <li><strong>Affaibli:</strong> les jets subissent +1 Desav</li>
              <li><strong>Assourdi:</strong> n'entends rien (les jet Perception basé sur l'ouïe échouent)</li>
              <li><strong>À terre:</strong> Force/Agilité +1 Desav. Adversaires gagnent 1 Av pour attaquer le PJ en mêlée, et Desav à distance</li>
              <li><strong>Aveugle:</strong> Vitesse maximum 2, ne voir rien</li>
              <li><strong>Effrayé:</strong> jet +1 Desav (+3 si en voit la source), ne peut pas faire de tours rapides</li>
              <li><strong>Empoisonné:</strong> jets +1 Desav</li>
              <li><strong>Endormi:</strong> à terre + inconsistant. Une créature peut utiliser une action pour réveiller le PJ</li>
            </ul>
          `
        },
        {
          title: "Actions (Non-exhaustif)",
          content: `
            <ul class="sodl-rules-list">
              <li><strong>Attaquer, lancer un sort, recharger une arme:</strong> effectue une action non-listée ici selon le guerrier</li>
              <li><strong>Aider:</strong> test d'Intellect pour donner +1 Av à une créature</li>
              <li><strong>Se préparer:</strong> déclarer une action et un déclencheur</li>
              <li><strong>Battre en retraite:</strong> Vitesse/2, évite les attaques gratuites</li>
              <li><strong>Chercher:</strong> trouver et partager la position d'une créature dissimulées</li>
            </ul>
          `
        }
      ]
    };
  }
  
  /**
   * Onglet: Aide de Jeu - Actions en détail
   */
  async getActionsData() {
    return {
      sections: [
        {
          title: "Lancer un Sort",
          content: `
            <div class="sodl-action">
              <p><strong>Formule:</strong> il faut la prononcer, donc pouvoir parler</p>
              <p><strong>Focale:</strong> il faut la brandir. C'est un objet comme une baguette, une amulete, Focale : il faut la brandir</p>
              <p><strong>Dépenser une utilisation:</strong> regagnée après un repos court ou long</p>
              <p><strong>Cible:</strong> Un PJ agissant agonisant (i), se relever affaibli (6), ou rester inconsistant (au bout de 3 rounds)</p>
            </div>
          `
        },
        {
          title: "Utiliser une Incantation",
          content: `
            <div class="sodl-action">
              <p>Ce sont des formules écrites sur un parchemin, gravées, peintes...</p>
              <p>Pour la lancer : jet d'Intellect</p>
              <p><strong>L'incantation est définie:</strong> Si la niveau du sort dépasse la Puissance du PJ, le jet subit autant de Désavantages que de différence</p>
              <p><strong>Si la Puissance du PJ est plus grande:</strong> pas besoin de faire jet</p>
            </div>
          `
        }
      ]
    };
  }
  
  /**
   * Onglet: Aide de Jeu - Informations générales
   */
  async getHelpData() {
    return {
      sections: [
        {
          title: "À propos de ce Module",
          content: `
            <div class="sodl-help">
              <p>Ce module compagnon pour <strong>L'Ombre du Seigneur Démon</strong> vous permet de:</p>
              <ul>
                <li>Gérer vos points de chance</li>
                <li>Accéder à des résumés de règles</li>
                <li>Consulter les descriptions d'actions</li>
                <li>Obtenir de l'aide de jeu</li>
              </ul>
              <p><strong>Note:</strong> Seul le MJ peut modifier les points de chance.</p>
            </div>
          `
        },
        {
          title: "Contrôle d'Accès",
          content: `
            <div class="sodl-help">
              <p><strong>Joueurs:</strong> Accès en lecture seule à tous les onglets</p>
              <p><strong>MJ:</strong> Accès complet avec possibilité de modification</p>
            </div>
          `
        }
      ]
    };
  }
  
  /**
   * Gestion des événements
   */
  activateListeners(html) {
    super.activateListeners(html);
    
    // Changement d'onglet
    html.find(".sodl-tab-nav button").on("click", (e) => {
      this.changeTab($(e.currentTarget).data("tab"));
    });
    
    // Points de chance
    html.find(".chance-increment").on("click", () => {
      if (game.user.isGM) {
        this.incrementChance(1);
      }
    });
    
    html.find(".chance-decrement").on("click", () => {
      if (game.user.isGM) {
        this.decrementChance(1);
      }
    });
    
    html.find(".chance-reset").on("click", () => {
      if (game.user.isGM) {
        this.resetChance();
      }
    });
  }
  
  /**
   * Change l'onglet actif
   */
  changeTab(tabName) {
    this.activeTab = tabName;
    this.render(false);
  }
  
  /**
   * Incrémente les points de chance
   */
  async incrementChance(amount) {
    const actor = game.user.character;
    if (!actor) {
      ui.notifications.warn("Aucun personnage sélectionné");
      return;
    }
    
    await SODLDataManager.modifyChancePoints(amount, actor);
    this.render(false);
    ui.notifications.info(`Points de chance augmentés de ${amount}`);
  }
  
  /**
   * Décrémente les points de chance
   */
  async decrementChance(amount) {
    const actor = game.user.character;
    if (!actor) {
      ui.notifications.warn("Aucun personnage sélectionné");
      return;
    }
    
    await SODLDataManager.modifyChancePoints(-amount, actor);
    this.render(false);
    ui.notifications.info(`Points de chance diminués de ${amount}`);
  }
  
  /**
   * Réinitialise les points de chance
   */
  async resetChance() {
    const actor = game.user.character;
    if (!actor) {
      ui.notifications.warn("Aucun personnage sélectionné");
      return;
    }
    
    await SODLDataManager.setChancePoints(0, actor);
    this.render(false);
    ui.notifications.info("Points de chance réinitialisés");
  }
  
  /**
   * Soumet le formulaire (désactivé pour les joueurs)
   */
  async _updateObject(event, formData) {
    // Le formulaire est en lecture seule pour les joueurs
    if (!game.user.isGM) {
      ui.notifications.error("Vous n'avez pas les permissions pour modifier");
      return;
    }
  }
}

window.SODLCompanionApp = SODLCompanionApp;
