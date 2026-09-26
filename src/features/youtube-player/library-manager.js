import { MODULE_ID } from "../../shared/constants.js";
import { errorMessage, t } from "../../shared/foundry-adapter.js";
import * as Library from "./library.js";
import { parseYoutubeVideoId } from "./url-parser.js";
import { SODLYoutubeSearch } from "./search-service.js";

const SETTING_KEY = "youtubeLibrary";

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

  static async _update(operation) {
    if (!game.user.isGM) {
      return false;
    }
    try {
      const library = operation(this.getLibrary());
      await game.settings.set(MODULE_ID, SETTING_KEY, library);
      return true;
    } catch (err) {
      ui.notifications.warn(errorMessage(err));
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
      ui.notifications.warn(t("SODL.Youtube.Errors.InvalidLink"));
      return false;
    }
    let finalTitle = String(title ?? "").trim();
    if (!finalTitle) {
      finalTitle = await this.fetchVideoTitle(videoId);
    }
    return this._update((library) => Library.addVideo(library, { title: finalTitle, videoId, folderId }, foundry.utils.randomID()));
  }

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
