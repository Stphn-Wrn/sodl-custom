/**
 * Logique pure de la diffusion synchronisée (aucune dépendance à Foundry).
 *
 * L'état décrit ce que tout le monde doit voir :
 *   { video: { id, title, videoId } | null, playing, position, updatedAt }
 * où `position` (en secondes) est la position de lecture à l'instant `updatedAt`
 * (en millisecondes, heure du serveur). Chaque client en déduit la position
 * attendue à tout moment, ce qui évite d'envoyer la position en continu.
 */

// Écart (en secondes) en dessous duquel on considère deux lecteurs synchronisés.
export const SYNC_TOLERANCE = 2;

export function createIdleBroadcast() {
  return { video: null, playing: false, position: 0, updatedAt: 0 };
}

export function startBroadcast(video, now) {
  return {
    video: { id: video.id, title: video.title, videoId: video.videoId },
    playing: true,
    position: 0,
    updatedAt: now
  };
}

export function updatePlayback(state, { playing, position }, now) {
  return { ...state, playing, position, updatedAt: now };
}

export function expectedPosition(state, now) {
  if (!state.playing) {
    return state.position;
  }
  return state.position + (now - state.updatedAt) / 1000;
}

/**
 * Indique si l'état observé d'un lecteur s'écarte de l'état diffusé :
 * lecture/pause différente, ou position trop éloignée (saut dans la vidéo).
 */
export function hasDiverged(state, { playing, position }, now) {
  if (!state.video) {
    return false;
  }
  if (state.playing !== playing) {
    return true;
  }
  return Math.abs(expectedPosition(state, now) - position) > SYNC_TOLERANCE;
}
