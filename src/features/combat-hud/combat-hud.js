import { MODULE_ID, modulePath } from "../../shared/constants.js";
import { renderTemplate, t } from "../../shared/foundry-adapter.js";
import { executeAction } from "./action-executor.js";
import { armRoll, DEFAULT_ROLL_OPTIONS, stepRollOption, takeArmedRoll } from "./roll-options.js";
import { PORTRAIT_FRAME_FLAG, toSnapshot } from "./actor-adapter.js";
import { computeAnchors, DEFAULT_ENTRIES_HEIGHT, resizeHeight } from "./layout.js";
import { DEFAULT_FRAME, framePortraitStyle, panFrame, zoomFrame } from "./portrait-frame.js";
import { afflictionCatalogue, createSections } from "./sections.js";
import { healthState } from "./health-state.js";

const HUD_TEMPLATE = modulePath("src/features/combat-hud/combat-hud.html");
const RENDER_DEBOUNCE_MS = 50;
const HUD_ACTIVE_CLASS = "sodl-hud-active";
const SWITCH_SIZE = 36;
const DICE_FACES = [2, 3, 4, 6, 8, 10, 12, 20, 100];
const DICE_MAX_COUNT = 8;
const MENU = { DICE: "dice", REST: "rest" };
const ROLL_KIND = {
  rollWeapon: "SODL.Hud.RollKind.Attack",
  castSpell: "SODL.Hud.RollKind.Spell",
  useTalent: "SODL.Hud.RollKind.Talent",
  useItem: "SODL.Hud.RollKind.Item",
  rollChallenge: "SODL.Hud.RollKind.Challenge",
  rollProfession: "SODL.Hud.RollKind.Profession"
};
const SWITCH_GAP = 8;

export const MODE = { HUD: "hud", FOUNDRY: "foundry" };

function catalogueAffliction(effect) {
  const statuses = Array.from(effect.statuses ?? []);
  return afflictionCatalogue(t).find((candidate) => statuses.includes(candidate.id));
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
  const count = Math.abs(boons);
  let kind = "Boons";
  if (boons < 0) {
    kind = "Banes";
  }
  let form = "One";
  if (count > 1) {
    form = "Many";
  }
  return t(`SODL.Hud.Roll.${kind}${form}`, { count });
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

export class SODLCombatHud {
  static instance = null;

  static mount() {
    if (!this.instance) {
      this.instance = new SODLCombatHud();
      this.instance.refreshActor();
    }
    return this.instance;
  }

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

  static onDocumentChanged(actor) {
    if (this.instance && actor && actor === this.instance.actor) {
      this.instance.requestRender();
    }
  }

  static onViewportChanged() {
    this.instance?.applyPosition();
  }

  static toggleMode() {
    this.instance?.toggleMode();
  }

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
    this.views = {};
    this.portraitDraft = null;
    this.openMenu = null;
    this.rollPanel = null;
    this.armedRoll = null;
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
        ui.notifications.info(t("SODL.Hud.Notify.SelectToken"));
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
    this.entries = current?.build(snapshot, this.views[current.id] ?? {}, t) ?? [];

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
      healthStatus: healthState(snapshot.characteristics, t),
      afflictions: this.actor.temporaryEffects.map(effectView),
      sections: sections.map((section) => ({ id: section.id, label: t(section.label), icon: section.icon, active: section === current })),
      entries: this.entries
    };
  }

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
    button.title = t("SODL.Hud.ShowHud");
    button.innerHTML = '<i class="fas fa-khanda"></i>';
    button.addEventListener("click", () => this.toggleMode());
    document.body.append(button);
    return button;
  }

  activateListeners(html) {
    html.find(".sodl-hud-tab").on("click", (event) => {
      const sectionId = event.currentTarget.dataset.section;
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

    html.find("[data-uses-item]").on("click", (event) => {
      event.stopPropagation();
      const { usesItem, amount } = event.currentTarget.dataset;
      executeAction(this.actor, { type: "adjustUses", itemId: usesItem, amount: Number(amount) });
    });

    html.find("[data-delete-effect]").on("click", (event) => {
      event.stopPropagation();
      executeAction(this.actor, { type: "deleteEffect", effectId: event.currentTarget.dataset.deleteEffect });
    });

    html.find("[data-rule]").on("click", (event) => {
      event.stopPropagation();
      executeAction(this.actor, { type: "postRule", ruleId: event.currentTarget.dataset.rule });
    });

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

  runAction(action, label = "") {
    if (action.rollOptions) {
      this.openMenu = null;
      const kind = t(ROLL_KIND[action.type] ?? "SODL.Hud.RollKind.Default");
      this.rollPanel = { action, title: t("SODL.Hud.RollTitle", { kind, name: label }), ...DEFAULT_ROLL_OPTIONS };
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

  confirmRoll() {
    const { action, boons, modifier } = this.rollPanel;
    this.rollPanel = null;
    this.armedRoll = armRoll({ boons, modifier }, Date.now());
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
