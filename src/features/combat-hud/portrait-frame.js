/**
 * Cadrage du portrait choisi par le joueur : un point de l'image (x, y en %)
 * et un zoom. Sans cadrage, l'image est affichée entière (object-fit: contain).
 */

export const DEFAULT_FRAME = { x: 50, y: 50, zoom: 1 };

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
// Variation de zoom par unité de molette (un cran vaut en général 100).
const ZOOM_PER_WHEEL_UNIT = 0.001;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function round(value) {
  return Math.round(value * 100) / 100;
}

// Glisser de `dx` px vers la droite montre la partie gauche de l'image : le
// point visé recule. `size` est la taille du cadre en px.
export function panFrame(frame, { dx, dy }, size) {
  const scale = 100 / (size * frame.zoom);
  return {
    x: round(clamp(frame.x - dx * scale, 0, 100)),
    y: round(clamp(frame.y - dy * scale, 0, 100)),
    zoom: frame.zoom
  };
}

// Molette vers le haut (deltaY négatif) : zoom avant.
export function zoomFrame(frame, wheelDeltaY) {
  const zoom = frame.zoom * (1 - wheelDeltaY * ZOOM_PER_WHEEL_UNIT);
  return { ...frame, zoom: round(clamp(zoom, MIN_ZOOM, MAX_ZOOM)) };
}

export function framePortraitStyle(frame) {
  if (!frame) {
    return "";
  }
  const point = `${frame.x}% ${frame.y}%`;
  return `object-fit: cover; object-position: ${point}; transform: scale(${frame.zoom}); transform-origin: ${point};`;
}
