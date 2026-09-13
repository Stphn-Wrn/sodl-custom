import { SODLDataManager } from "./data-manager.js";
import { SODL_CONFIG } from "./config.js";

function listToHtml(list) {
  return `
    <ul class="sodl-rules-list">
      ${list.map(item => `<li><strong>${item.name}:</strong> ${item.description}</li>`).join("")}
    </ul>
  `;
}

function spellUsesTableToHtml(table) {
  const head = table.header.map(h => `<th>${h}</th>`).join("");
  const rows = table.rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join("")}</tr>`).join("");
  return `
    <table class="sodl-spell-table">
      <thead><tr>${head}</tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

export class SODLCompanionApp extends FormApplication {
  constructor(options = {}) {
    super({}, options);
    this.activeTab = "resources";
    this.searchQuery = "";
    this.searchIndex = this.buildSearchIndex();
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
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

  buildSearchIndex() {
    const index = [];

    const addAll = (category, list) => {
      for (const item of list) {
        index.push({ category, name: item.name, description: item.description });
      }
    };

    addAll("Affliction", SODL_CONFIG.afflictions.list);
    addAll("Action", SODL_CONFIG.actions.list);
    addAll("Mêlée", SODL_CONFIG.meleeOptions.list);
    addAll("Tir", SODL_CONFIG.rangedOptions.list);
    addAll("Attaque", SODL_CONFIG.otherAttacks.list);
    addAll("Règle", SODL_CONFIG.situationalRules.list);

    index.push({ category: "Règle", name: "Hors de Combat", description: SODL_CONFIG.outOfCombat.content });
    index.push({ category: "Règle", name: "Folie", description: SODL_CONFIG.madness.content });
    index.push({ category: "Règle", name: "Corruption", description: SODL_CONFIG.corruption.content });
    index.push({
      category: "Fortune",
      name: "Points de Chance",
      description: SODL_CONFIG.chancePointsRules.gains
    });
    addAll("Fortune", SODL_CONFIG.chancePointsRules.extendedUses);
    index.push({ category: "Sort", name: "Formule", description: SODL_CONFIG.spellcasting.formula });
    index.push({ category: "Sort", name: "Focale", description: SODL_CONFIG.spellcasting.focus });
    index.push({ category: "Sort", name: "Incantation", description: SODL_CONFIG.spellcasting.incantation.description });

    return index;
  }

  searchResults(query) {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return this.searchIndex.filter(entry =>
      entry.name.toLowerCase().includes(q) || entry.description.toLowerCase().includes(q)
    );
  }

  async getData(options = {}) {
    const data = await super.getData(options);

    data.isGM = game.user.isGM;
    data.canEdit = game.user.isGM;
    data.activeTab = this.activeTab;

    data.tabs = {
      resources: this.getResourcesData(),
      rules: await this.getRulesData(),
      actions: await this.getActionsData(),
      help: await this.getHelpData()
    };

    return data;
  }


  getResourcesData() {
    return {
      chancePoints: SODLDataManager.getChancePoints(),
      maxChancePoints: SODLDataManager.getMaxChancePoints(),
      rules: SODL_CONFIG.chancePointsRules,
      awardsTable: SODL_CONFIG.fortuneAwardsTable
    };
  }

  async getRulesData() {
    return {
      sections: [
        {
          title: "Afflictions",
          content: listToHtml(SODL_CONFIG.afflictions.list)
        },
        {
          title: "Règles Situationnelles",
          content: listToHtml(SODL_CONFIG.situationalRules.list)
        },
        {
          title: "Hors de Combat",
          content: `<p>${SODL_CONFIG.outOfCombat.content}</p>`
        },
        {
          title: "Folie",
          content: `<p>${SODL_CONFIG.madness.content}</p>`
        },
        {
          title: "Corruption",
          content: `<p>${SODL_CONFIG.corruption.content}</p>`
        }
      ]
    };
  }


  async getActionsData() {
    const sc = SODL_CONFIG.spellcasting;
    return {
      sections: [
        {
          title: "Actions (Non-exhaustif)",
          content: listToHtml(SODL_CONFIG.actions.list)
        },
        {
          title: "Options en Mêlée",
          content: listToHtml(SODL_CONFIG.meleeOptions.list)
        },
        {
          title: "Options de Tir",
          content: listToHtml(SODL_CONFIG.rangedOptions.list)
        },
        {
          title: "Autres Types d'Attaques",
          content: listToHtml(SODL_CONFIG.otherAttacks.list)
        },
        {
          title: "Lancer un Sort",
          content: `
            <div class="sodl-action">
              <p><strong>Formule:</strong> ${sc.formula}</p>
              <p><strong>Focale:</strong> ${sc.focus}</p>
              <p><strong>Dépenser une utilisation:</strong> ${sc.useCost}</p>
              <p><strong>${sc.nonConsenting}</strong></p>
            </div>
            ${spellUsesTableToHtml(sc.usesTable)}
          `
        },
        {
          title: "Utiliser une Incantation",
          content: `
            <div class="sodl-action">
              <p>${sc.incantation.description}</p>
              <p>${sc.incantation.cast}</p>
              <p>${sc.incantation.powerVsLevel}</p>
              <p>${sc.incantation.higherPower}</p>
            </div>
          `
        }
      ]
    };
  }


  async getHelpData() {
    return {
      sections: [
        {
          title: "À propos de ce Module",
          content: `
            <div class="sodl-help">
              <p>Ce module compagnon pour <strong>L'Ombre du Seigneur Démon</strong> vous permet de:</p>
              <ul>
                <li>Gérer les points de chance du groupe</li>
                <li>Accéder à des résumés de règles</li>
                <li>Consulter les descriptions d'actions</li>
                <li>Rechercher instantanément une affliction, une action ou une règle</li>
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

  activateListeners(html) {
    super.activateListeners(html);

    html.find(".sodl-tab-nav button").on("click", (e) => {
      this.changeTab($(e.currentTarget).data("tab"));
    });

    html.find(".sodl-search-input").on("input", (e) => {
      this.onSearchInput(html, e.currentTarget.value);
    });

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

    html.find(".chance-max-input").on("change", (e) => {
      if (game.user.isGM) {
        this.setMaxChance(Number(e.currentTarget.value));
      }
    });
  }

  onSearchInput(html, query) {
    this.searchQuery = query;
    const results = this.searchResults(query);
    const resultsPanel = html.find(".sodl-search-results");
    const normalView = html.find(".sodl-normal-view");

    if (!query.trim()) {
      resultsPanel.hide().empty();
      normalView.show();
      return;
    }

    normalView.hide();

    if (!results.length) {
      resultsPanel.html(`<p class="sodl-search-empty">Aucun résultat pour "${query}".</p>`).show();
      return;
    }

    const html_ = results.map(entry => `
      <div class="sodl-search-result">
        <span class="sodl-search-category">${entry.category}</span>
        <h4>${entry.name}</h4>
        <p>${entry.description}</p>
      </div>
    `).join("");

    resultsPanel.html(html_).show();
  }

  changeTab(tabName) {
    this.activeTab = tabName;
    this.render(false);
  }

  async incrementChance(amount) {
    await SODLDataManager.modifyChancePoints(amount);
    this.render(false);
    ui.notifications.info(`Points de chance du groupe augmentés de ${amount}`);
  }

  async decrementChance(amount) {
    await SODLDataManager.modifyChancePoints(-amount);
    this.render(false);
    ui.notifications.info(`Points de chance du groupe diminués de ${amount}`);
  }

  async resetChance() {
    await SODLDataManager.setChancePoints(0);
    this.render(false);
    ui.notifications.info("Points de chance du groupe réinitialisés");
  }

  async setMaxChance(value) {
    await SODLDataManager.setMaxChancePoints(value);
    this.render(false);
  }

  async _updateObject(event, formData) {
    if (!game.user.isGM) {
      ui.notifications.error("Vous n'avez pas les permissions pour modifier");
      return;
    }
  }
}
