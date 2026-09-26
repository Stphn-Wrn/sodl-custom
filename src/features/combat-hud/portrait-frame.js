export const DEFAULT_FRAME = { x: 50, y: 50, zoom: 1 };

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;

const ZOOM_PER_WHEEL_UNIT = 0.001;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function round(value) {
  return Math.round(value * 100) / 100;
}

export function panFrame(frame, { dx, dy }, size) {
  const scale = 100 / (size * frame.zoom);
  return {
    x: round(clamp(frame.x - dx * scale, 0, 100)),
    y: round(clamp(frame.y - dy * scale, 0, 100)),
    zoom: frame.zoom
  };
}

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
