import { modulePath } from "../../shared/constants.js";
import { escapeHTML, t } from "../../shared/foundry-adapter.js";
import { SODLDataManager } from "./data-manager.js";
import { localizedConfig } from "./config.js";

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
    this.config = localizedConfig(t);
    this.searchIndex = this.buildSearchIndex();
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      title: t("SODL.Companion.WindowTitle"),
      id: "sodl-companion-app",
      template: modulePath("src/features/companion/companion.html"),
      width: 800,
      height: 600,
      resizable: true,
      minimizable: true,
      classes: ["sodl-app"]
    });
  }

  buildSearchIndex() {
    const config = this.config;
    const category = (key) => t(`SODL.Companion.Categories.${key}`);
    const index = [];

    const addAll = (categoryKey, list) => {
      for (const item of list) {
        index.push({ category: category(categoryKey), name: item.name, description: item.description });
      }
    };

    addAll("Affliction", config.afflictions.list);
    addAll("Action", config.actions.list);
    addAll("Melee", config.meleeOptions.list);
    addAll("Ranged", config.rangedOptions.list);
    addAll("Attack", config.otherAttacks.list);
    addAll("Rule", config.situationalRules.list);

    index.push({ category: category("Rule"), name: t("SODL.Companion.Sections.OutOfCombat"), description: config.outOfCombat.content });
    index.push({ category: category("Rule"), name: t("SODL.Companion.Sections.Madness"), description: config.madness.content });
    index.push({ category: category("Rule"), name: t("SODL.Companion.Sections.Corruption"), description: config.corruption.content });
    index.push({
      category: category("Fortune"),
      name: t("SODL.Companion.ChancePoints"),
      description: config.chancePointsRules.gains
    });
    addAll("Fortune", config.chancePointsRules.extendedUses);
    index.push({ category: category("Spell"), name: t("SODL.Companion.Spell.Formula"), description: config.spellcasting.formula });
    index.push({ category: category("Spell"), name: t("SODL.Companion.Spell.Focus"), description: config.spellcasting.focus });
    index.push({ category: category("Spell"), name: t("SODL.Companion.Spell.Incantation"), description: config.spellcasting.incantation.description });

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
      rules: this.config.chancePointsRules,
      awardsTable: this.config.fortuneAwardsTable
    };
  }

  async getRulesData() {
    const config = this.config;
    const section = (key) => t(`SODL.Companion.Sections.${key}`);
    return {
      sections: [
        {
          title: section("Afflictions"),
          content: listToHtml(config.afflictions.list)
        },
        {
          title: section("Situational"),
          content: listToHtml(config.situationalRules.list)
        },
        {
          title: section("OutOfCombat"),
          content: `<p>${config.outOfCombat.content}</p>`
        },
        {
          title: section("Madness"),
          content: `<p>${config.madness.content}</p>`
        },
        {
          title: section("Corruption"),
          content: `<p>${config.corruption.content}</p>`
        }
      ]
    };
  }


  async getActionsData() {
    const config = this.config;
    const sc = config.spellcasting;
    const section = (key) => t(`SODL.Companion.Sections.${key}`);
    return {
      sections: [
        {
          title: section("ActionsList"),
          content: listToHtml(config.actions.list)
        },
        {
          title: section("Melee"),
          content: listToHtml(config.meleeOptions.list)
        },
        {
          title: section("Ranged"),
          content: listToHtml(config.rangedOptions.list)
        },
        {
          title: section("OtherAttacks"),
          content: listToHtml(config.otherAttacks.list)
        },
        {
          title: section("CastSpell"),
          content: `
            <div class="sodl-action">
              <p><strong>${t("SODL.Companion.Spell.Formula")}:</strong> ${sc.formula}</p>
              <p><strong>${t("SODL.Companion.Spell.Focus")}:</strong> ${sc.focus}</p>
              <p><strong>${t("SODL.Companion.Spell.SpendCasting")}:</strong> ${sc.useCost}</p>
              <p><strong>${sc.nonConsenting}</strong></p>
            </div>
            ${spellUsesTableToHtml(sc.usesTable)}
          `
        },
        {
          title: section("UseIncantation"),
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
    const about = (key) => t(`SODL.Companion.About.${key}`);
    return {
      sections: [
        {
          title: t("SODL.Companion.Sections.About"),
          content: `
            <div class="sodl-help">
              <p>${about("Intro")}</p>
              <ul>
                <li>${about("Item1")}</li>
                <li>${about("Item2")}</li>
                <li>${about("Item3")}</li>
                <li>${about("Item4")}</li>
              </ul>
              <p>${about("Note")}</p>
            </div>
          `
        },
        {
          title: t("SODL.Companion.Sections.Access"),
          content: `
            <div class="sodl-help">
              <p>${t("SODL.Companion.Access.Players")}</p>
              <p>${t("SODL.Companion.Access.Gm")}</p>
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
      resultsPanel.html(`<p class="sodl-search-empty">${t("SODL.Companion.NoResults", { query: escapeHTML(query) })}</p>`).show();
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
    ui.notifications.info(t("SODL.Companion.Notify.Increased", { amount }));
  }

  async decrementChance(amount) {
    await SODLDataManager.modifyChancePoints(-amount);
    this.render(false);
    ui.notifications.info(t("SODL.Companion.Notify.Decreased", { amount }));
  }

  async resetChance() {
    await SODLDataManager.setChancePoints(0);
    this.render(false);
    ui.notifications.info(t("SODL.Companion.Notify.Reset"));
  }

  async setMaxChance(value) {
    await SODLDataManager.setMaxChancePoints(value);
    this.render(false);
  }

  async _updateObject(event, formData) {
    if (!game.user.isGM) {
      ui.notifications.error(t("SODL.Companion.Notify.PermissionDenied"));
      return;
    }
  }
}
