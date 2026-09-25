/**
 * Mise en page du HUD en mode « HUD » : il occupe le bas de l'écran, du bord
 * de l'interface de gauche (liste des joueurs) jusqu'à la barre latérale, à la
 * place de la barre de macros. Seule la hauteur de la zone d'actions se règle.
 */

export const DEFAULT_ENTRIES_HEIGHT = 84;

const MIN_HEIGHT = 36;
const MAX_HEIGHT = 480;
const GUTTER = 16;
// Espace laissé entre le HUD et la barre latérale.
const SIDEBAR_GAP = 8;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

// Tirer la poignée vers le haut (dy négatif) agrandit la zone d'actions.
export function resizeHeight(startHeight, dy) {
  return clamp(startHeight - dy, MIN_HEIGHT, MAX_HEIGHT);
}

// Positions `left` / `right` (en px, CSS `position: fixed`) à partir des bords mesurés.
export function computeAnchors({ uiLeftX, sidebarX, viewportWidth }) {
  let left = GUTTER;
  if (typeof uiLeftX === "number") {
    left = uiLeftX;
  }
  let right = GUTTER;
  if (typeof sidebarX === "number") {
    right = viewportWidth - sidebarX + SIDEBAR_GAP;
  }
  return { left, right };
}
