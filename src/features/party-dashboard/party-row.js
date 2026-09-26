import { healthState } from "../combat-hud/health-state.js";
import { afflictionCatalogue, afflictionName } from "../combat-hud/sections.js";

function percent(value, max) {
  if (max <= 0) {
    return 0;
  }
  return Math.round((value / max) * 100);
}

export function partyRow(actorId, snapshot, t) {
  const values = snapshot.characteristics;
  const state = healthState(values, t);
  let turnLabel = t("SODL.Hud.Turn.Slow");
  if (snapshot.fastTurn) {
    turnLabel = t("SODL.Hud.Turn.Fast");
  }
  return {
    actorId,
    name: snapshot.name,
    img: snapshot.img,
    stateId: state.id,
    stateLabel: state.label,
    health: values.health,
    healthMax: values.healthMax,
    healthPercent: percent(values.health, values.healthMax),
    defense: values.defense,
    speed: values.speed,
    insanity: `${values.insanity}/${values.insanityMax}`,
    corruption: values.corruption,
    turnLabel,
    fastTurn: snapshot.fastTurn,
    afflictions: afflictionCatalogue(t)
      .filter((affliction) => snapshot.statuses.includes(affliction.id))
      .map(afflictionName)
  };
}
