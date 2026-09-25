import { companionFeature } from "./features/companion/register.js";
import { diceClockFeature } from "./features/dice-clock/register.js";
import { youtubePlayerFeature } from "./features/youtube-player/register.js";
import { combatHudFeature } from "./features/combat-hud/register.js";

/**
 * Point d'entrée du module. Chaque fonctionnalité vit dans son dossier
 * `features/<nom>/` et expose les étapes dont elle a besoin :
 *   - init()                             : settings, globales, templates
 *   - ready()                            : actions une fois la partie chargée
 *   - getSceneControlButtons(controls)   : boutons dans les contrôles de scène
 * Pour ajouter une fonctionnalité, il suffit de l'ajouter à cette liste.
 */
const FEATURES = [companionFeature, diceClockFeature, youtubePlayerFeature, combatHudFeature];

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
