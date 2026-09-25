/**
 * État de santé affiché par la couleur du HUD, d'après les règles :
 * blessé à partir de la moitié de la Santé en dégâts, neutralisé quand les
 * dégâts égalent la Santé.
 */
export function healthState({ damage, healthMax }) {
  if (healthMax <= 0) {
    return { id: "unknown", label: "Santé non renseignée" };
  }
  if (damage >= healthMax) {
    return { id: "incapacitated", label: "Neutralisé" };
  }
  if (damage * 2 >= healthMax) {
    return { id: "injured", label: "Blessé" };
  }
  if (damage > 0) {
    return { id: "hurt", label: "Touché" };
  }
  return { id: "full", label: "Indemne" };
}
