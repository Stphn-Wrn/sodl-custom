import { companionFeature } from "./features/companion/register.js";
import { diceClockFeature } from "./features/dice-clock/register.js";
import { youtubePlayerFeature } from "./features/youtube-player/register.js";
import { combatHudFeature } from "./features/combat-hud/register.js";
import { roundRemindersFeature } from "./features/round-reminders/register.js";
import { partyDashboardFeature } from "./features/party-dashboard/register.js";

const FEATURES = [companionFeature, diceClockFeature, youtubePlayerFeature, combatHudFeature, roundRemindersFeature, partyDashboardFeature];

function runStep(step, ...args) {
  for (const feature of FEATURES) {
    if (typeof feature[step] === "function") {
      feature[step](...args);
    }
  }
}

Hooks.once("init", () => {
  console.log("SODL Companion | Initializing");
  runStep("init");
});

Hooks.once("ready", () => runStep("ready"));

Hooks.on("getSceneControlButtons", (controls) => runStep("getSceneControlButtons", controls));
