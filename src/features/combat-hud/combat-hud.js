import { MODULE_ID, modulePath } from "../../shared/constants.js";
import { renderTemplate } from "../../shared/foundry-adapter.js";
import { executeAction } from "./action-executor.js";
import { toSnapshot } from "./actor-adapter.js";
import { computeAnchors, DEFAULT_ENTRIES_HEIGHT, resizeHeight } from "./layout.js";
import { createSections } from "./sections.js";

const HUD_TEMPLATE = modulePath("src/features/combat-hud/combat-hud.html");
// Plusieurs mises à jour arrivent souvent d'un coup (équiper = plusieurs objets).
const RENDER_DEBOUNCE_MS = 50;
// Classe posée sur <body> quand le HUD remplace la barre de macros et les joueurs.
const HUD_ACTIVE_CLASS = "sodl-hud-active";
const SWITCH_SIZE = 36;
const SWITCH_GAP = 8;

export const MODE = { HUD: "hud", FOUNDRY: "foundry" };

function measureLeft(elementId) {
  const rect = document.getElementById(elementId)?.getBoundingClientRect();
  if (!rect || rect.width === 0) {
    return null;
  }
  return rect.left;
}

/**
 * HUD de combat du token contrôlé (ou, à défaut, du personnage du joueur).
 *
 * Deux modes, basculés par un bouton (et un raccourci clavier) :
 * - « HUD » : le HUD occupe le bas de l'écran, de la liste des joueurs
 *   jusqu'à la barre latérale, et masque la barre de macros et les joueurs ;
 * - « Foundry » : l'interface d'origine, avec un bouton pour revenir au HUD.
 *
 * Pas de surveillance continue : le HUD se redessine uniquement sur les hooks
 * Foundry qui concernent l'acteur affiché (cf. register.js).
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

  // Taille de l'écran ou barre latérale repliée/dépliée.
  static onViewportChanged() {
    this.instance?.applyPosition();
  }

  static toggleMode() {
    this.instance?.toggleMode();
  }

  constructor() {
    this.element = null;
    this.actor = null;
    this.entries = [];
    // Vue courante de chaque onglet (ex. tradition ouverte), propre à l'acteur affiché.
    this.views = {};
    const layout = game.settings.get(MODULE_ID, "combatHudLayout");
    this.activeSection = layout.activeSection ?? "attacks";
    this.mode = layout.mode ?? MODE.HUD;
    this.entriesHeight = layout.entriesHeight ?? DEFAULT_ENTRIES_HEIGHT;
    this.requestRender = foundry.utils.debounce(() => this.render(), RENDER_DEBOUNCE_MS);
    this.switchButton = this.createSwitchButton();
  }

  get isShown() {
    return this.mode === MODE.HUD && Boolean(this.actor);
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
    const actor = this.resolveActor();
    if (actor !== this.actor) {
      this.views = {};
    }
    this.actor = actor;
    this.requestRender();
  }

  toggleMode() {
    if (this.mode === MODE.HUD) {
      this.mode = MODE.FOUNDRY;
    } else {
      this.mode = MODE.HUD;
      if (!this.actor) {
        ui.notifications.info("Sélectionnez un token pour afficher le HUD de combat.");
      }
    }
    this.saveLayout();
    this.render();
  }

  async render() {
    this.element?.remove();
    this.element = null;
    document.body.classList.toggle(HUD_ACTIVE_CLASS, this.isShown);

    if (this.isShown) {
      const html = await renderTemplate(HUD_TEMPLATE, this.getData());
      this.element = $(html);
      $(document.body).append(this.element);
      this.activateListeners(this.element);
    }
    this.applyPosition();
  }

  getData() {
    const snapshot = toSnapshot(this.actor);
    const sections = createSections(snapshot.type);
    let current = sections.find((section) => section.id === this.activeSection);
    if (!current) {
      current = sections[0];
    }
    this.currentSectionId = current?.id;
    this.entries = current?.build(snapshot, this.views[current.id] ?? {}) ?? [];

    let healthPercent = 0;
    if (snapshot.characteristics.healthMax > 0) {
      healthPercent = Math.round((snapshot.characteristics.health / snapshot.characteristics.healthMax) * 100);
    }

    return {
      snapshot,
      healthPercent,
      entriesHeight: this.entriesHeight,
      afflictions: this.actor.temporaryEffects.map((effect) => ({ name: effect.name, img: effect.img ?? effect.icon })),
      sections: sections.map((section) => ({ id: section.id, label: section.label, icon: section.icon, active: section === current })),
      entries: this.entries
    };
  }

  // Le HUD s'étend de l'interface de gauche jusqu'à la barre latérale ; le
  // bouton de bascule se place juste à gauche de la barre de macros.
  applyPosition() {
    if (this.element) {
      const anchors = computeAnchors({
        uiLeftX: measureLeft("ui-left"),
        sidebarX: measureLeft("sidebar"),
        viewportWidth: window.innerWidth
      });
      this.element[0].style.left = `${anchors.left}px`;
      this.element[0].style.right = `${anchors.right}px`;
    }

    this.switchButton.hidden = this.isShown;
    const hotbar = document.getElementById("hotbar")?.getBoundingClientRect();
    if (hotbar && hotbar.width > 0) {
      this.switchButton.style.left = `${Math.max(SWITCH_GAP, hotbar.left - SWITCH_SIZE - SWITCH_GAP)}px`;
      this.switchButton.style.top = `${hotbar.top + (hotbar.height - SWITCH_SIZE) / 2}px`;
    }
  }

  createSwitchButton() {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "sodl-hud-switch";
    button.title = "Afficher le HUD de combat";
    button.innerHTML = '<i class="fas fa-khanda"></i>';
    button.addEventListener("click", () => this.toggleMode());
    document.body.append(button);
    return button;
  }

  activateListeners(html) {
    html.find(".sodl-hud-tab").on("click", (event) => {
      this.activeSection = event.currentTarget.dataset.section;
      this.saveLayout();
      this.render();
    });

    html.find(".sodl-hud-to-foundry").on("click", () => this.toggleMode());

    html.find("[data-action-type]").on("click", (event) => {
      const { actionType, amount } = event.currentTarget.dataset;
      executeAction(this.actor, { type: actionType, amount: Number(amount) });
    });

    html.find(".sodl-hud-grip").on("pointerdown", (event) => this.startResize(event));

    html.find(".sodl-hud-entry").on("click", (event) => {
      const entry = this.entries[Number(event.currentTarget.dataset.entry)];
      if (!entry || entry.disabled) {
        return;
      }
      if (entry.action.type === "navigate") {
        this.views[this.currentSectionId] = entry.action.view;
        this.render();
        return;
      }
      executeAction(this.actor, entry.action);
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

  // Hauteur de la zone d'actions, modifiée en direct pendant le glisser et sauvegardée au relâchement.
  startResize(event) {
    event.preventDefault();
    const grip = event.currentTarget;
    const originY = event.clientY;
    const startHeight = this.entriesHeight;
    grip.setPointerCapture(event.pointerId);

    const onMove = (moveEvent) => {
      this.entriesHeight = resizeHeight(startHeight, moveEvent.clientY - originY);
      this.element[0].style.setProperty("--hud-entries-height", `${this.entriesHeight}px`);
    };
    const onUp = () => {
      grip.removeEventListener("pointermove", onMove);
      grip.removeEventListener("pointerup", onUp);
      this.saveLayout();
    };
    grip.addEventListener("pointermove", onMove);
    grip.addEventListener("pointerup", onUp);
  }

  saveLayout() {
    game.settings.set(MODULE_ID, "combatHudLayout", {
      activeSection: this.activeSection,
      mode: this.mode,
      entriesHeight: this.entriesHeight
    });
  }
}
