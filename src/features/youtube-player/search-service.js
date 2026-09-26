import { MODULE_ID } from "../../shared/constants.js";
import { t } from "../../shared/foundry-adapter.js";
import { classifyQuery, createSearchProvider, thumbnailUrl } from "./search.js";

export class SODLYoutubeSearch {
  static _provider() {
    const instances = String(game.settings.get(MODULE_ID, "youtubeInvidiousInstances") ?? "")
      .split(/[\s,]+/)
      .filter(Boolean);
    return createSearchProvider({
      apiKey: game.settings.get(MODULE_ID, "youtubeApiKey"),
      instances,
      fetch: (...args) => fetch(...args)
    });
  }

  static async query(input) {
    const query = classifyQuery(input);
    if (query.kind === "empty") {
      return [];
    }
    if (query.kind === "link") {
      return [await this.lookupVideo(query.videoId)];
    }
    if (query.kind === "links") {
      return Promise.all(query.videoIds.map((videoId) => this.lookupVideo(videoId)));
    }
    return this._provider().search(query.text);
  }

  // Infos publiques d'une vidéo via oEmbed (sans clé) ; à défaut, l'ID sert de titre.
  static async lookupVideo(videoId) {
    const result = { videoId, title: t("SODL.Youtube.VideoFallback", { id: videoId }), channel: "", duration: null, thumbnail: thumbnailUrl(videoId) };
    const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
    try {
      const response = await fetch(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(watchUrl)}`);
      if (response.ok) {
        const data = await response.json();
        if (data?.title) {
          result.title = data.title;
        }
        if (data?.author_name) {
          result.channel = data.author_name;
        }
      }
    } catch (err) {
      console.warn("SODL Companion | Could not fetch video info", err);
    }
    return result;
  }
}
