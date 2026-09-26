// `position` (s) est la position à l'instant `updatedAt` (ms, heure serveur) :
// chaque client en déduit la position courante sans la recevoir en continu.

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

export function hasDiverged(state, { playing, position }, now) {
  if (!state.video) {
    return false;
  }
  if (state.playing !== playing) {
    return true;
  }
  return Math.abs(expectedPosition(state, now) - position) > SYNC_TOLERANCE;
}
