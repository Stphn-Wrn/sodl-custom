// Un ID de vidéo YouTube fait toujours 11 caractères parmi [A-Za-z0-9_-].
const VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

const YOUTUBE_HOSTS = ["youtube.com", "www.youtube.com", "m.youtube.com", "music.youtube.com", "youtube-nocookie.com", "www.youtube-nocookie.com"];

function toUrl(input) {
  try {
    return new URL(input);
  } catch {
    return null;
  }
}

function validId(candidate) {
  if (candidate && VIDEO_ID_PATTERN.test(candidate)) {
    return candidate;
  }
  return null;
}

/**
 * Stratégies d'extraction de l'ID d'une vidéo. Chacune reconnaît un format
 * d'entrée et retourne l'ID trouvé, ou null pour laisser la main à la suivante.
 * Pour supporter un nouveau format, il suffit d'ajouter une stratégie ici.
 */
const PARSING_STRATEGIES = [
  // ID brut : "dQw4w9WgXcQ"
  (input) => validId(input),

  // Lien court : https://youtu.be/<id>
  (input) => {
    const url = toUrl(input);
    if (!url || url.hostname !== "youtu.be") {
      return null;
    }
    return validId(url.pathname.split("/")[1]);
  },

  // Lien classique : https://www.youtube.com/watch?v=<id>
  (input) => {
    const url = toUrl(input);
    if (!url || !YOUTUBE_HOSTS.includes(url.hostname) || url.pathname !== "/watch") {
      return null;
    }
    return validId(url.searchParams.get("v"));
  },

  // Chemins dédiés : /embed/<id>, /shorts/<id>, /live/<id>
  (input) => {
    const url = toUrl(input);
    if (!url || !YOUTUBE_HOSTS.includes(url.hostname)) {
      return null;
    }
    const [, kind, id] = url.pathname.split("/");
    if (!["embed", "shorts", "live"].includes(kind)) {
      return null;
    }
    return validId(id);
  }
];

/**
 * Retourne l'ID de la vidéo YouTube désignée par une URL ou un ID brut,
 * ou null si l'entrée n'est pas reconnue.
 */
export function parseYoutubeVideoId(input) {
  if (typeof input !== "string") {
    return null;
  }
  const trimmed = input.trim();
  for (const strategy of PARSING_STRATEGIES) {
    const id = strategy(trimmed);
    if (id) {
      return id;
    }
  }
  return null;
}
