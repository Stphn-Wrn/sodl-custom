import { MODULE_ID } from "../../shared/constants.js";
import * as Library from "./library.js";
import { parseYoutubeVideoId } from "./url-parser.js";
import { SODLYoutubeSearch } from "./search-service.js";

const SETTING_KEY = "youtubeLibrary";

/**
 * Persiste la bibliothèque de vidéos YouTube dans un paramètre "world" :
 * tout le monde la consulte, seul le MJ peut la modifier.
 */
export class SODLYoutubeManager {
  static getLibrary() {
    const stored = game.settings.get(MODULE_ID, SETTING_KEY);
    return foundry.utils.mergeObject(Library.createEmptyLibrary(), foundry.utils.deepClone(stored ?? {}));
  }

  static getLibraryView() {
    return Library.buildLibraryView(this.getLibrary());
  }

  static findVideo(id) {
    return this.getLibrary().videos.find((video) => video.id === id) ?? null;
  }

  // Applique une opération pure de library.js puis sauvegarde.
  // Les erreurs de validation sont affichées au MJ plutôt que levées.
  static async _update(operation) {
    if (!game.user.isGM) {
      return false;
    }
    try {
      const library = operation(this.getLibrary());
      await game.settings.set(MODULE_ID, SETTING_KEY, library);
      return true;
    } catch (err) {
      ui.notifications.warn(err.message);
      return false;
    }
  }

  static addFolder(name) {
    return this._update((library) => Library.addFolder(library, name, foundry.utils.randomID()));
  }

  static renameFolder(folderId, name) {
    return this._update((library) => Library.renameFolder(library, folderId, name));
  }

  static removeFolder(folderId) {
    return this._update((library) => Library.removeFolder(library, folderId));
  }

  static async addVideo({ url, title, folderId }) {
    const videoId = parseYoutubeVideoId(url);
    if (!videoId) {
      ui.notifications.warn("Lien YouTube invalide.");
      return false;
    }
    let finalTitle = String(title ?? "").trim();
    if (!finalTitle) {
      finalTitle = await this.fetchVideoTitle(videoId);
    }
    return this._update((library) => Library.addVideo(library, { title: finalTitle, videoId, folderId }, foundry.utils.randomID()));
  }

  // Ajoute plusieurs vidéos déjà identifiées ({ title, videoId }) en une seule sauvegarde.
  static addVideos(videos, folderId) {
    return this._update((library) => videos.reduce(
      (current, video) => Library.addVideo(current, { ...video, folderId }, foundry.utils.randomID()),
      library
    ));
  }

  static renameVideo(id, title) {
    return this._update((library) => Library.renameVideo(library, id, title));
  }

  static moveVideo(id, folderId) {
    return this._update((library) => Library.moveVideo(library, id, folderId));
  }

  static removeVideo(id) {
    return this._update((library) => Library.removeVideo(library, id));
  }

  static async fetchVideoTitle(videoId) {
    const video = await SODLYoutubeSearch.lookupVideo(videoId);
    return video.title;
  }
}
