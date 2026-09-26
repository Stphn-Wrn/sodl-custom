function state(id, t) {
  return { id, label: t(`SODL.Hud.Health.${id}`) };
}

export function healthState({ damage, healthMax }, t) {
  if (healthMax <= 0) {
    return state("unknown", t);
  }
  if (damage >= healthMax) {
    return state("incapacitated", t);
  }
  if (damage * 2 >= healthMax) {
    return state("injured", t);
  }
  if (damage > 0) {
    return state("hurt", t);
  }
  return state("full", t);
}
