import { MODULE_ID, modulePath } from "../../shared/constants.js";
import { renderTemplate } from "../../shared/foundry-adapter.js";
import { executeAction } from "./action-executor.js";
import { armRoll, DEFAULT_ROLL_OPTIONS, stepRollOption, takeArmedRoll } from "./roll-options.js";
import { PORTRAIT_FRAME_FLAG, toSnapshot } from "./actor-adapter.js";
import { computeAnchors, DEFAULT_ENTRIES_HEIGHT, resizeHeight } from "./layout.js";
import { DEFAULT_FRAME, framePortraitStyle, panFrame, zoomFrame } from "./portrait-frame.js";
import { createSections } from "./sections.js";
import { healthState } from "./health-state.js";
import { SODL_CONFIG } from "../companion/config.js";

const HUD_TEMPLATE = modulePath("src/features/combat-hud/combat-hud.html");
// Plusieurs mises à jour arrivent souvent d'un coup (équiper = plusieurs objets).
const RENDER_DEBOUNCE_MS = 50;
// Classe posée sur <body> quand le HUD remplace la barre de macros et les joueurs.
const HUD_ACTIVE_CLASS = "sodl-hud-active";
const SWITCH_SIZE = 36;
// Grille du lanceur de dés : un type de dé par ligne, un nombre de dés par colonne.
const DICE_FACES = [2, 3, 4, 6, 8, 10, 12, 20, 100];
const DICE_MAX_COUNT = 8;
const MENU = { DICE: "dice", REST: "rest" };
// Intitulé du panneau de jet selon le type d'action.
const ROLL_KIND = {
  rollWeapon: "Attaque",
  castSpell: "Sort",
  useTalent: "Talent",
  useItem: "Objet",
  rollChallenge: "Défi",
  rollProfession: "Profession"
};
const SWITCH_GAP = 8;

export const MODE = { HUD: "hud", FOUNDRY: "foundry" };

// Affliction de l'aide de jeu du compagnon correspondant à un effet actif.
function catalogueAffliction(effect) {
  const statuses = Array.from(effect.statuses ?? []);
  return SODL_CONFIG.afflictions.list.find((candidate) => statuses.includes(candidate.id));
}

function effectView(effect) {
  const affliction = catalogueAffliction(effect);
  return {
    name: effect.name,
    img: effect.img ?? effect.icon,
    description: affliction?.description ?? "",
    ruleId: affliction?.id ?? ""
  };
}

function boonsLabel(boons) {
  if (boons < 0) {
    return `${-boons} fléau${pluralSuffix(-boons, "x")}`;
  }
  return `${boons} faveur${pluralSuffix(boons, "s")}`;
}

function pluralSuffix(count, suffix) {
  if (count > 1) {
    return suffix;
  }
  return "";
}

function signed(value) {
  if (value > 0) {
    return `+${value}`;
  }
  return `${value}`;
}

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

  // Désactivation en cours de partie : on retire le HUD et on rend l'interface d'origine.
  static unmount() {
    if (!this.instance) {
      return;
    }
    this.instance.destroy();
    this.instance = null;
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

  // Fenêtre de jet du système : si le HUD vient d'armer un jet (panneau de jet
  // validé), on la remplit avec ses faveurs/fléaux et son modificateur, puis on
  // la valide sans l'afficher.
  static onDialogRendered(element) {
    const instance = this.instance;
    const root = element?.[0] ?? element;
    const boonsInput = root?.querySelector?.("#boonsbanes");
    if (!instance || !boonsInput) {
      return;
    }
    const options = takeArmedRoll(instance.armedRoll, Date.now());
    instance.armedRoll = null;
    if (!options) {
      return;
    }
    boonsInput.value = options.boons;
    const modifierInput = root.querySelector("#modifier");
    if (modifierInput) {
      modifierInput.value = options.modifier;
    }
    root.style.visibility = "hidden";
    setTimeout(() => root.querySelector('button[data-action="roll"]')?.click(), 0);
  }

  constructor() {
    this.element = null;
    this.actor = null;
    this.entries = [];
    // Vue courante de chaque onglet (ex. tradition ouverte), propre à l'acteur affiché.
    this.views = {};
    // Cadrage du portrait en cours d'édition (null hors édition).
    this.portraitDraft = null;
    // Menu ouvert au-dessus des outils (dés ou repos), un seul à la fois.
    this.openMenu = null;
    // Panneau de jet ouvert : { action, title, boons, modifier } (null sinon).
    this.rollPanel = null;
    this.armedRoll = null;
    // Numéro du dernier rendu lancé : un rendu dépassé par un plus récent s'abandonne.
    this.renderToken = 0;
    const layout = game.settings.get(MODULE_ID, "combatHudLayout");
    this.activeSection = layout.activeSection ?? "attacks";
    this.mode = layout.mode ?? MODE.HUD;
    this.entriesHeight = layout.entriesHeight ?? DEFAULT_ENTRIES_HEIGHT;
    this.requestRender = foundry.utils.debounce(() => this.render(), RENDER_DEBOUNCE_MS);
    this.switchButton = this.createSwitchButton();
  }

  destroy() {
    this.element?.remove();
    this.element = null;
    this.switchButton.remove();
    document.body.classList.remove(HUD_ACTIVE_CLASS);
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
      this.portraitDraft = null;
      this.rollPanel = null;
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
    if (SODLCombatHud.instance !== this) {
      return;
    }
    this.renderToken += 1;
    const token = this.renderToken;

    let html = null;
    if (this.isShown) {
      html = await renderTemplate(HUD_TEMPLATE, this.getData());
      if (token !== this.renderToken || SODLCombatHud.instance !== this) {
        return;
      }
    }

    this.element?.remove();
    this.element = null;
    document.body.classList.toggle(HUD_ACTIVE_CLASS, this.isShown);

    if (html) {
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

    let portraitFrame = snapshot.portraitFrame;
    if (this.portraitDraft) {
      portraitFrame = this.portraitDraft;
    }

    return {
      snapshot,
      healthPercent,
      editingPortrait: Boolean(this.portraitDraft),
      rollPanel: this.rollPanelData(),
      diceMenuOpen: this.openMenu === MENU.DICE,
      restMenuOpen: this.openMenu === MENU.REST,
      diceCounts: Array.from({ length: DICE_MAX_COUNT }, (_, index) => index + 1),
      diceFaces: DICE_FACES,
      restFullHealing: snapshot.characteristics.healingRate * 2,
      portraitStyle: framePortraitStyle(portraitFrame),
      entriesHeight: this.entriesHeight,
      healthStatus: healthState(snapshot.characteristics),
      afflictions: this.actor.temporaryEffects.map(effectView),
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
      const sectionId = event.currentTarget.dataset.section;
      // Re-cliquer sur l'onglet ouvert revient à sa vue principale.
      if (sectionId === this.currentSectionId) {
        this.views[sectionId] = {};
      }
      this.activeSection = sectionId;
      this.saveLayout();
      this.render();
    });

    html.find(".sodl-hud-to-foundry").on("click", () => this.toggleMode());

    html.find(".sodl-hud-open-sheet").on("click", () => this.actor.sheet.render(true));

    html.find("[data-menu-toggle]").on("click", (event) => {
      const menu = event.currentTarget.dataset.menuToggle;
      if (this.openMenu === menu) {
        this.openMenu = null;
      } else {
        this.openMenu = menu;
      }
      this.render();
    });

    html.find("[data-action-type]").on("click", (event) => {
      const { actionType, amount, faces } = event.currentTarget.dataset;
      // Un choix dans un menu le referme.
      if (this.openMenu && event.currentTarget.closest(".sodl-hud-menu")) {
        this.openMenu = null;
        this.render();
      }
      this.runAction({ type: actionType, amount: Number(amount), faces: Number(faces) });
    });

    html.find(".sodl-hud-grip").on("pointerdown", (event) => this.startResize(event));

    this.activatePortraitListeners(html);

    html.find(".sodl-hud-entry").on("click", (event) => {
      const entry = this.entries[Number(event.currentTarget.dataset.entry)];
      if (!entry || entry.disabled || !entry.action) {
        return;
      }
      if (entry.action.type === "navigate") {
        this.views[this.currentSectionId] = entry.action.view;
        this.render();
        return;
      }
      this.runAction(entry.action, entry.name);
    });

    this.activateRollPanelListeners(html);

    // −/+ au survol d'un sort ou d'un talent : corrige ses utilisations sans le lancer.
    html.find("[data-uses-item]").on("click", (event) => {
      event.stopPropagation();
      const { usesItem, amount } = event.currentTarget.dataset;
      executeAction(this.actor, { type: "adjustUses", itemId: usesItem, amount: Number(amount) });
    });

    html.find("[data-delete-effect]").on("click", (event) => {
      event.stopPropagation();
      executeAction(this.actor, { type: "deleteEffect", effectId: event.currentTarget.dataset.deleteEffect });
    });

    // Infobulle (i) et icônes d'afflictions : postent la règle dans le chat.
    html.find("[data-rule]").on("click", (event) => {
      event.stopPropagation();
      executeAction(this.actor, { type: "postRule", ruleId: event.currentTarget.dataset.rule });
    });

    // Clic droit : ouvrir la fiche de l'objet pour le détail.
    html.find(".sodl-hud-entry").on("contextmenu", (event) => {
      event.preventDefault();
      const entry = this.entries[Number(event.currentTarget.dataset.entry)];
      if (entry?.effectId) {
        this.actor.effects.get(entry.effectId)?.sheet.render(true);
        return;
      }
      const item = this.actor.items.get(entry?.action?.itemId ?? entry?.itemId);
      if (item) {
        item.sheet.render(true);
      }
    });
  }

  // Un jet pour lequel le système demande faveurs/fléaux ouvre d'abord le
  // panneau de jet du HUD ; les autres actions s'exécutent directement.
  runAction(action, label = "") {
    if (action.rollOptions) {
      this.openMenu = null;
      this.rollPanel = { action, title: `${ROLL_KIND[action.type] ?? "Jet"} : ${label}`, ...DEFAULT_ROLL_OPTIONS };
      this.render();
      return undefined;
    }
    return executeAction(this.actor, action);
  }

  rollPanelData() {
    if (!this.rollPanel) {
      return null;
    }
    return {
      title: this.rollPanel.title,
      boonsLabel: boonsLabel(this.rollPanel.boons),
      boonsTone: Math.sign(this.rollPanel.boons),
      modifier: signed(this.rollPanel.modifier)
    };
  }

  // Lancer : on arme le jet avec les valeurs du panneau, puis le système ouvre
  // sa fenêtre, remplie et validée automatiquement (cf. onDialogRendered).
  confirmRoll() {
    const { action, boons, modifier } = this.rollPanel;
    this.rollPanel = null;
    this.armedRoll = armRoll({ boons, modifier }, Date.now());
    // Après le jet d'une profession, on revient à la liste des caractéristiques.
    if (action.type === "rollProfession") {
      this.views[this.currentSectionId] = {};
    }
    this.render();
    return executeAction(this.actor, action);
  }

  activateRollPanelListeners(html) {
    if (!this.rollPanel) {
      return;
    }
    html.find("[data-roll-option]").on("click", (event) => {
      const { rollOption, delta } = event.currentTarget.dataset;
      this.rollPanel[rollOption] = stepRollOption(rollOption, this.rollPanel[rollOption], Number(delta));
      this.render();
    });
    html.find("[data-roll-reset]").on("click", (event) => {
      this.rollPanel[event.currentTarget.dataset.rollReset] = 0;
      this.render();
    });
    html.find("[data-roll-confirm]").on("click", () => this.confirmRoll());
    html.find("[data-roll-cancel]").on("click", () => {
      this.rollPanel = null;
      this.render();
    });
  }

  // Clic : passe en recadrage. Glisser déplace l'image, la molette zoome ;
  // le cadrage est enregistré sur l'acteur, donc vu par tous.
  activatePortraitListeners(html) {
    const portrait = html.find(".sodl-hud-portrait")[0];
    const img = portrait.querySelector("img");

    if (!this.portraitDraft) {
      portrait.addEventListener("click", () => {
        this.portraitDraft = { ...DEFAULT_FRAME, ...toSnapshot(this.actor).portraitFrame };
        this.render();
      });
      return;
    }

    const updateDraft = (frame) => {
      this.portraitDraft = frame;
      img.style.cssText = framePortraitStyle(frame);
    };

    img.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      img.setPointerCapture(event.pointerId);
      let last = { x: event.clientX, y: event.clientY };
      const onMove = (moveEvent) => {
        const delta = { dx: moveEvent.clientX - last.x, dy: moveEvent.clientY - last.y };
        last = { x: moveEvent.clientX, y: moveEvent.clientY };
        updateDraft(panFrame(this.portraitDraft, delta, portrait.clientWidth));
      };
      const onUp = () => {
        img.removeEventListener("pointermove", onMove);
        img.removeEventListener("pointerup", onUp);
      };
      img.addEventListener("pointermove", onMove);
      img.addEventListener("pointerup", onUp);
    });

    portrait.addEventListener("wheel", (event) => {
      event.preventDefault();
      updateDraft(zoomFrame(this.portraitDraft, event.deltaY));
    }, { passive: false });

    html.find("[data-portrait]").on("click", async (event) => {
      const choice = event.currentTarget.dataset.portrait;
      const draft = this.portraitDraft;
      this.portraitDraft = null;
      if (choice === "save") {
        await this.actor.setFlag(MODULE_ID, PORTRAIT_FRAME_FLAG, draft);
      } else if (choice === "reset") {
        await this.actor.unsetFlag(MODULE_ID, PORTRAIT_FRAME_FLAG);
      }
      this.render();
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
