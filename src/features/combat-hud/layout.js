export const DEFAULT_ENTRIES_HEIGHT = 110;

const MIN_HEIGHT = 36;
const MAX_HEIGHT = 300;
const GUTTER = 16;

const SIDEBAR_GAP = 8;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function resizeHeight(startHeight, dy) {
  return clamp(startHeight - dy, MIN_HEIGHT, MAX_HEIGHT);
}

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

export function clampEntriesHeight(height) {
  if (typeof height !== "number") {
    return DEFAULT_ENTRIES_HEIGHT;
  }
  return clamp(height, MIN_HEIGHT, MAX_HEIGHT);
}
