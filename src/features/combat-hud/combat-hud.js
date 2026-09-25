import { MODULE_ID, modulePath } from "../../shared/constants.js";
import { renderTemplate } from "../../shared/foundry-adapter.js";
import { changeDamage, executeAction } from "./action-executor.js";
import { toSnapshot } from "./actor-adapter.js";
import { createSections } from "./sections.js";

const HUD_TEMPLATE = modulePath("src/features/combat-hud/combat-hud.html");
// Plusieurs mises à jour arrivent souvent d'un coup (équiper = plusieurs objets).
const RENDER_DEBOUNCE_MS = 50;

/**
 * Barre de combat ancrée en bas de l'écran pour le token contrôlé (ou, à
 * défaut, le personnage du joueur). Elle reprend l'inventaire et les
 * caractéristiques sous une forme adaptée au combat.
 *
 * Pas de surveillance continue : la barre se redessine uniquement sur les
 * hooks Foundry qui concernent l'acteur affiché (cf. register.js).
 */
export class SODLCombatHud {
  static instance = null;

  static mount() {
    if (!this.instance) {
      this.instance = new SODLCombatHud();
      this.instance.refreshActor();
    }
    return this.instance;
  }

  static onTokenControlChanged() {
    this.instance?.refreshActor();
  }

  // Appelé par les hooks d'acteur, d'objet et d'effet.
  static onDocumentChanged(actor) {
    if (this.instance && actor && actor === this.instance.actor) {
      this.instance.requestRender();
    }
  }

  constructor() {
    this.element = null;
    this.actor = null;
    this.entries = [];
    const layout = game.settings.get(MODULE_ID, "combatHudLayout");
    this.activeSection = layout.activeSection ?? "attacks";
    this.collapsed = Boolean(layout.collapsed);
    this.requestRender = foundry.utils.debounce(() => this.render(), RENDER_DEBOUNCE_MS);
  }

  resolveActor() {
    const controlled = canvas?.tokens?.controlled ?? [];
    if (controlled.length === 1 && controlled[0].actor?.isOwner) {
      return controlled[0].actor;
    }
    if (!game.user.isGM && game.user.character) {
      return game.user.character;
    }
    return null;
  }

  refreshActor() {
    this.actor = this.resolveActor();
    this.requestRender();
  }

  async render() {
    this.element?.remove();
    this.element = null;
    if (!this.actor) {
      return;
    }

    const html = await renderTemplate(HUD_TEMPLATE, this.getData());
    this.element = $(html);
    $(document.body).append(this.element);
    this.activateListeners(this.element);
  }

  getData() {
    const snapshot = toSnapshot(this.actor);
    const sections = createSections(snapshot.type);
    let current = sections.find((section) => section.id === this.activeSection);
    if (!current) {
      current = sections[0];
    }
    this.entries = current?.build(snapshot) ?? [];

    let healthPercent = 0;
    if (snapshot.characteristics.healthMax > 0) {
      healthPercent = Math.round((snapshot.characteristics.health / snapshot.characteristics.healthMax) * 100);
    }

    return {
      snapshot,
      healthPercent,
      collapsed: this.collapsed,
      afflictions: this.actor.temporaryEffects.map((effect) => ({ name: effect.name, img: effect.img ?? effect.icon })),
      sections: sections.map((section) => ({ id: section.id, label: section.label, icon: section.icon, active: section === current })),
      entries: this.entries
    };
  }

  activateListeners(html) {
    html.find(".sodl-hud-tab").on("click", (event) => {
      this.activeSection = event.currentTarget.dataset.section;
      this.saveLayout();
      this.render();
    });

    html.find(".sodl-hud-collapse").on("click", () => {
      this.collapsed = !this.collapsed;
      this.saveLayout();
      this.render();
    });

    html.find("[data-damage]").on("click", (event) => {
      changeDamage(this.actor, Number(event.currentTarget.dataset.damage));
    });

    html.find(".sodl-hud-entry").on("click", (event) => {
      const entry = this.entries[Number(event.currentTarget.dataset.entry)];
      if (entry && !entry.disabled) {
        executeAction(this.actor, entry.action);
      }
    });

    // Clic droit : ouvrir la fiche de l'objet pour le détail.
    html.find(".sodl-hud-entry").on("contextmenu", (event) => {
      event.preventDefault();
      const entry = this.entries[Number(event.currentTarget.dataset.entry)];
      const item = this.actor.items.get(entry?.action?.itemId);
      if (item) {
        item.sheet.render(true);
      }
    });
  }

  saveLayout() {
    game.settings.set(MODULE_ID, "combatHudLayout", { activeSection: this.activeSection, collapsed: this.collapsed });
  }
}
