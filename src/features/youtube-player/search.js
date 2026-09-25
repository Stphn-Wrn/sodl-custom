import { parseYoutubeVideoId } from "./url-parser.js";

/**
 * Logique pure de la recherche YouTube (aucune dépendance à Foundry).
 *
 * Chaque fournisseur expose `search(text)` et retourne des résultats normalisés :
 *   { videoId, title, channel, duration (secondes ou null), thumbnail }
 * `fetch` est injecté pour pouvoir tester sans réseau.
 */

export const SEARCH_RESULTS_LIMIT = 12;
const DATA_API_URL = "https://www.googleapis.com/youtube/v3/search";
const INSTANCE_TIMEOUT_MS = 6000;

const HTML_ENTITIES = { amp: "&", lt: "<", gt: ">", quot: "\"", apos: "'" };

// L'API YouTube Data renvoie des titres encodés en HTML (&#39;, &amp;...).
function decodeHtml(text) {
  return String(text ?? "").replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, code) => {
    if (code[0] !== "#") {
      return HTML_ENTITIES[code.toLowerCase()] ?? match;
    }
    let value = parseInt(code.slice(1), 10);
    if (code[1] === "x" || code[1] === "X") {
      value = parseInt(code.slice(2), 16);
    }
    if (Number.isNaN(value)) {
      return match;
    }
    return String.fromCodePoint(value);
  });
}

export function thumbnailUrl(videoId) {
  return `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;
}

function toResult({ videoId, title, channel, duration = null }) {
  return { videoId, title, channel, duration, thumbnail: thumbnailUrl(videoId) };
}

// Un ID brut n'est pas pris pour un lien : un mot de 11 lettres est ambigu.
function parseLink(text) {
  if (!text.includes("/")) {
    return null;
  }
  return parseYoutubeVideoId(text);
}

/**
 * Un lien YouTube désigne directement une vidéo ; plusieurs liens (un par
 * ligne, ou séparés par des espaces ou des virgules) forment une liste,
 * sans doublon ; tout le reste est une recherche.
 */
export function classifyQuery(input) {
  const text = String(input ?? "").trim();
  if (!text) {
    return { kind: "empty" };
  }
  const videoId = parseLink(text);
  if (videoId) {
    return { kind: "link", videoId };
  }
  const videoIds = [...new Set(text.split(/[\s,;]+/).map(parseLink).filter(Boolean))];
  if (videoIds.length > 1) {
    return { kind: "links", videoIds };
  }
  return { kind: "text", text };
}

export function parseDataApiResults(body) {
  const items = body?.items ?? [];
  return items
    .filter((item) => item?.id?.videoId)
    .map((item) => toResult({
      videoId: item.id.videoId,
      title: decodeHtml(item.snippet?.title),
      channel: decodeHtml(item.snippet?.channelTitle)
    }));
}

export function parseInvidiousResults(body) {
  if (!Array.isArray(body)) {
    return [];
  }
  return body
    .filter((item) => item?.type === "video" && item.videoId)
    .map((item) => toResult({
      videoId: item.videoId,
      title: item.title ?? "",
      channel: item.author ?? "",
      duration: item.lengthSeconds ?? null
    }));
}

async function fetchJson(fetch, url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.json();
}

// API officielle : fiable, mais demande une clé (quota gratuit quotidien).
function createDataApiProvider({ apiKey, fetch }) {
  return {
    async search(text) {
      const url = new URL(DATA_API_URL);
      url.searchParams.set("part", "snippet");
      url.searchParams.set("type", "video");
      url.searchParams.set("videoEmbeddable", "true");
      url.searchParams.set("maxResults", String(SEARCH_RESULTS_LIMIT));
      url.searchParams.set("q", text);
      url.searchParams.set("key", apiKey);
      let body;
      try {
        body = await fetchJson(fetch, url.toString());
      } catch (err) {
        throw new Error(`Recherche YouTube refusée (${err.message}) : vérifiez la clé API.`);
      }
      return parseDataApiResults(body);
    }
  };
}

// Instances publiques Invidious : sans clé, mais leur disponibilité varie.
// On les essaie dans l'ordre jusqu'à ce que l'une réponde.
function createInvidiousProvider({ instances, fetch }) {
  return {
    async search(text) {
      for (const instance of instances) {
        const url = new URL("/api/v1/search", instance);
        url.searchParams.set("q", text);
        url.searchParams.set("type", "video");
        const options = {};
        if (typeof AbortSignal !== "undefined" && AbortSignal.timeout) {
          options.signal = AbortSignal.timeout(INSTANCE_TIMEOUT_MS);
        }
        try {
          const body = await fetchJson(fetch, url.toString(), options);
          return parseInvidiousResults(body).slice(0, SEARCH_RESULTS_LIMIT);
        } catch (err) {
          console.warn(`SODL Companion | Instance Invidious indisponible : ${instance}`, err);
        }
      }
      throw new Error("Aucun service de recherche n'a répondu. Renseignez une clé API YouTube dans les paramètres du module.");
    }
  };
}

/**
 * Choisit le fournisseur de recherche : l'API officielle si une clé est
 * configurée, sinon les instances Invidious.
 */
export function createSearchProvider({ apiKey, instances, fetch }) {
  const key = String(apiKey ?? "").trim();
  if (key) {
    return createDataApiProvider({ apiKey: key, fetch });
  }
  return createInvidiousProvider({ instances, fetch });
}
