import { modulePath } from "../../shared/constants.js";
import { t } from "../../shared/foundry-adapter.js";
import { SODLDataManager } from "../companion/data-manager.js";
import { executeAction } from "../combat-hud/action-executor.js";
import { toSnapshot } from "../combat-hud/actor-adapter.js";
import { partyRow } from "./party-row.js";

function partyActors() {
  return game.actors.filter((actor) => actor.type === "character" && actor.hasPlayerOwner);
}

export class SODLPartyDashboard extends Application {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: "sodl-party-dashboard",
      title: t("SODL.Dashboard.Title"),
      template: modulePath("src/features/party-dashboard/party-dashboard.html"),
      width: 640,
      height: "auto",
      resizable: true,
      minimizable: true,
      classes: ["sodl-party-dashboard"]
    });
  }

  static isPartyActor(actor) {
    return Boolean(actor) && actor.type === "character" && actor.hasPlayerOwner;
  }

  getData() {
    return {
      rows: partyActors().map((actor) => partyRow(actor.id, toSnapshot(actor), t)),
      fortune: SODLDataManager.getChancePoints(),
      fortuneMax: SODLDataManager.getMaxChancePoints()
    };
  }

  activateListeners(html) {
    super.activateListeners(html);
    const actorOf = (event) => game.actors.get(event.currentTarget.closest("[data-actor-id]").dataset.actorId);

    html.find("[data-damage]").on("click", (event) => {
      executeAction(actorOf(event), { type: "changeDamage", amount: Number(event.currentTarget.dataset.damage) });
    });

    html.find("[data-toggle-turn]").on("click", (event) => {
      executeAction(actorOf(event), { type: "toggleTurn" });
    });

    html.find("[data-open-sheet]").on("click", (event) => {
      actorOf(event).sheet.render(true);
    });

    html.find("[data-select-token]").on("click", (event) => {
      const actor = actorOf(event);
      const token = actor.getActiveTokens()[0];
      if (!token) {
        ui.notifications.info(t("SODL.Dashboard.NoToken", { name: actor.name }));
        return;
      }
      token.control({ releaseOthers: true });
      canvas.animatePan({ x: token.center.x, y: token.center.y });
    });
  }
}
