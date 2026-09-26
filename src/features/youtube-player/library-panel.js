import { modulePath } from "../../shared/constants.js";
import { errorMessage, renderTemplate, t } from "../../shared/foundry-adapter.js";
import { SODLYoutubeManager } from "./library-manager.js";
import { SODLYoutubeBroadcast } from "./broadcast-manager.js";
import { SODLYoutubeSearch } from "./search-service.js";
import { formatTime } from "./time-format.js";

export const LIBRARY_TEMPLATE = modulePath("src/features/youtube-player/library.html");
const RESULTS_TEMPLATE = modulePath("src/features/youtube-player/search-results.html");
// Délai pendant lequel un bouton de suppression attend le second clic de confirmation.
const CONFIRM_DELAY_MS = 3000;
const DRAG_TYPE = "application/x-sodl-youtube-video";

/**
 * Panneau du MJ sous le lecteur : recherche YouTube et bibliothèque.
 * Tout se fait sur place, sans boîte de dialogue : création et renommage
 * dans des champs en ligne, déplacement par glisser-déposer, suppression
 * confirmée par un second clic.
 */
export class SODLYoutubeLibraryPanel {
  constructor(element) {
    this.element = element;
    // Dossiers repliés : état local à chaque client, non partagé.
    this.collapsedFolders = new Set();
    this.search = { searched: false, loading: false, error: null, results: [] };
    this.targetFolderId = null;
    this._activeVideoId = this._currentVideoId();
    this._searchToken = 0;

    const searchForm = this.element.find(".yt-search");
    searchForm.on("submit", (event) => {
      event.preventDefault();
      this._runSearch(event.currentTarget.elements.query.value);
    });
    // Un champ d'une ligne supprime les retours à la ligne, ce qui collerait les
    // liens les uns aux autres : un collage multiligne est donc traité ici.
    searchForm.find("input").on("paste", (event) => {
      const text = event.originalEvent.clipboardData?.getData("text") ?? "";
      if (!/[\r\n]/.test(text.trim())) {
        return;
      }
      event.preventDefault();
      const joined = text.split(/\s+/).filter(Boolean).join(" ");
      event.currentTarget.value = joined;
      this._runSearch(joined);
    });
    this._activateLibraryListeners(this.element.find(".yt-library"));
  }

  _currentVideoId() {
    return SODLYoutubeBroadcast.getState().video?.videoId ?? null;
  }

  // Ne re-rend que si la vidéo diffusée a changé (mise en évidence dans la liste).
  onBroadcastChanged() {
    const videoId = this._currentVideoId();
    if (videoId !== this._activeVideoId) {
      this.refresh();
    }
  }

  async refresh() {
    await Promise.all([this._renderLibrary(), this._renderResults()]);
  }

  // -------- Recherche --------

  async _runSearch(query) {
    if (!String(query ?? "").trim()) {
      return;
    }
    const token = ++this._searchToken;
    this.search = { searched: true, loading: true, error: null, results: [] };
    this._renderResults();
    try {
      const results = await SODLYoutubeSearch.query(query);
      if (token !== this._searchToken) {
        return;
      }
      this.search = { searched: true, loading: false, error: null, results };
    } catch (err) {
      if (token !== this._searchToken) {
        return;
      }
      this.search = { searched: true, loading: false, error: errorMessage(err), results: [] };
    }
    this._renderResults();
  }

  _findSavedVideo(videoId) {
    return SODLYoutubeManager.getLibrary().videos.find((video) => video.videoId === videoId) ?? null;
  }

  _getResultsData() {
    const folders = SODLYoutubeManager.getLibrary().folders
      .map((folder) => ({ ...folder, selected: folder.id === this.targetFolderId }))
      .sort((a, b) => a.name.localeCompare(b.name, "fr", { sensitivity: "base" }));
    const results = this.search.results.map((result) => {
      let durationLabel = "";
      if (result.duration) {
        durationLabel = formatTime(result.duration);
      }
      return { ...result, durationLabel, saved: Boolean(this._findSavedVideo(result.videoId)) };
    });
    const unsavedCount = results.filter((result) => !result.saved).length;
    return { ...this.search, folders, results, unsavedCount, canAddAll: unsavedCount > 1 };
  }

  async _renderResults() {
    const html = $(await renderTemplate(RESULTS_TEMPLATE, this._getResultsData()));
    this.element.find(".yt-search-results").replaceWith(html);

    html.find(".yt-clear-results").on("click", () => {
      this._searchToken++;
      this.search = { searched: false, loading: false, error: null, results: [] };
      this.element.find(".yt-search input").val("");
      this._renderResults();
    });

    html.find(".yt-target-folder select").on("change", (event) => {
      this.targetFolderId = event.currentTarget.value || null;
    });

    html.find(".yt-add-all").on("click", () => {
      const unsaved = this.search.results
        .filter((result) => !this._findSavedVideo(result.videoId))
        .map(({ title, videoId }) => ({ title, videoId }));
      SODLYoutubeManager.addVideos(unsaved, this.targetFolderId);
    });

    const resultAt = (event) => this.search.results[Number($(event.currentTarget).closest(".yt-result").attr("data-index"))];

    html.find(".yt-result-play").on("click", (event) => {
      const result = resultAt(event);
      const saved = this._findSavedVideo(result.videoId);
      SODLYoutubeBroadcast.start({ id: saved?.id ?? null, title: saved?.title ?? result.title, videoId: result.videoId });
    });

    html.find(".yt-result-add").on("click", (event) => {
      const result = resultAt(event);
      SODLYoutubeManager.addVideo({ url: result.videoId, title: result.title, folderId: this.targetFolderId });
    });
  }

  // -------- Bibliothèque --------

  _getLibraryData() {
    this._activeVideoId = this._currentVideoId();
    const groups = SODLYoutubeManager.getLibraryView().map((group) => ({
      ...group,
      name: t(group.name),
      collapsed: this.collapsedFolders.has(group.id ?? ""),
      videos: group.videos.map((video) => ({ ...video, active: video.videoId === this._activeVideoId }))
    }));
    return { groups };
  }

  async _renderLibrary() {
    const html = $(await renderTemplate(LIBRARY_TEMPLATE, this._getLibraryData()));
    this.element.find(".yt-library").replaceWith(html);
    this._activateLibraryListeners(html);
  }

  _activateLibraryListeners(html) {
    const ignoresClick = (event) => $(event.target).closest("a, input, button").length > 0;
    const folderIdOf = (el) => $(el).closest(".yt-folder").attr("data-folder-id") || null;
    const videoOf = (el) => SODLYoutubeManager.findVideo($(el).closest(".yt-video").attr("data-video-id"));

    html.find(".yt-folder-header").on("click", (event) => {
      if (ignoresClick(event)) {
        return;
      }
      const folder = $(event.currentTarget).closest(".yt-folder");
      const key = folder.attr("data-folder-id") ?? "";
      folder.toggleClass("yt-folder-collapsed");
      if (folder.hasClass("yt-folder-collapsed")) {
        this.collapsedFolders.add(key);
      } else {
        this.collapsedFolders.delete(key);
      }
    });

    html.find(".yt-video").on("click", (event) => {
      if (ignoresClick(event)) {
        return;
      }
      const video = videoOf(event.currentTarget);
      if (video) {
        SODLYoutubeBroadcast.start(video);
      }
    });

    this._activateNewFolderForm(html);

    html.find(".yt-folder-header .yt-rename").on("click", (event) => {
      const folderId = folderIdOf(event.currentTarget);
      this._editInline($(event.currentTarget).siblings(".yt-folder-name"), (name) => SODLYoutubeManager.renameFolder(folderId, name));
    });

    html.find(".yt-video .yt-rename").on("click", (event) => {
      const video = videoOf(event.currentTarget);
      this._editInline($(event.currentTarget).siblings(".yt-video-title"), (title) => SODLYoutubeManager.renameVideo(video.id, title));
    });

    html.find(".yt-folder-header .yt-remove").on("click", (event) => {
      const folderId = folderIdOf(event.currentTarget);
      this._confirmClick($(event.currentTarget), () => SODLYoutubeManager.removeFolder(folderId));
    });

    html.find(".yt-video .yt-remove").on("click", (event) => {
      const video = videoOf(event.currentTarget);
      this._confirmClick($(event.currentTarget), () => SODLYoutubeManager.removeVideo(video.id));
    });

    this._activateDragAndDrop(html);
  }

  _activateNewFolderForm(html) {
    const form = html.find(".yt-new-folder");
    const input = form.find("input");
    const close = () => {
      form.removeClass("yt-inline-form-open");
      input.val("");
    };

    html.find(".yt-new-folder-toggle").on("click", () => {
      form.toggleClass("yt-inline-form-open");
      if (form.hasClass("yt-inline-form-open")) {
        input.trigger("focus");
      }
    });
    form.find(".yt-inline-cancel").on("click", close);
    input.on("keydown", (event) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        close();
      }
    });
    form.on("submit", (event) => {
      event.preventDefault();
      SODLYoutubeManager.addFolder(input.val());
    });
  }

  /**
   * Remplace un libellé par un champ de saisie. Entrée ou perte du focus
   * enregistrent, Échap annule. La bibliothèque est re-rendue après sauvegarde.
   */
  _editInline(label, onSave) {
    const original = label.text();
    const input = $('<input type="text" class="yt-inline-input">').val(original);
    label.replaceWith(input);
    // Une ligne glissable empêche de sélectionner le texte du champ.
    const row = input.closest("[draggable]");
    row.attr("draggable", "false");
    input.trigger("focus").trigger("select");

    let done = false;
    const finish = (save) => {
      if (done) {
        return;
      }
      done = true;
      const value = String(input.val()).trim();
      if (save && value && value !== original) {
        onSave(value);
        return;
      }
      input.replaceWith(label);
      row.attr("draggable", "true");
    };

    input.on("click", (event) => event.stopPropagation());
    input.on("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        finish(true);
      }
      if (event.key === "Escape") {
        event.stopPropagation();
        finish(false);
      }
    });
    input.on("blur", () => finish(true));
  }

  // Premier clic : le bouton passe en attente de confirmation ; second clic : action.
  _confirmClick(button, onConfirm) {
    if (button.hasClass("yt-confirm")) {
      onConfirm();
      return;
    }
    const originalTitle = button.attr("title");
    button.addClass("yt-confirm").attr("title", t("SODL.Youtube.ConfirmClick"));
    setTimeout(() => {
      button.removeClass("yt-confirm").attr("title", originalTitle);
    }, CONFIRM_DELAY_MS);
  }

  // Glisser une vidéo sur un dossier (ou « Non classé ») l'y déplace.
  _activateDragAndDrop(html) {
    html.find(".yt-video").on("dragstart", (event) => {
      const transfer = event.originalEvent.dataTransfer;
      transfer.setData(DRAG_TYPE, $(event.currentTarget).attr("data-video-id"));
      transfer.effectAllowed = "move";
    });

    const folders = html.find(".yt-folder");
    const carriesVideo = (event) => event.originalEvent.dataTransfer.types.includes(DRAG_TYPE);

    folders.on("dragover", (event) => {
      if (!carriesVideo(event)) {
        return;
      }
      event.preventDefault();
      folders.removeClass("yt-drop-target");
      $(event.currentTarget).addClass("yt-drop-target");
    });
    folders.on("dragleave", (event) => {
      if (!event.currentTarget.contains(event.originalEvent.relatedTarget)) {
        $(event.currentTarget).removeClass("yt-drop-target");
      }
    });
    folders.on("drop", (event) => {
      event.preventDefault();
      folders.removeClass("yt-drop-target");
      const videoId = event.originalEvent.dataTransfer.getData(DRAG_TYPE);
      const folderId = $(event.currentTarget).attr("data-folder-id") || null;
      const video = SODLYoutubeManager.findVideo(videoId);
      if (video && video.folderId !== folderId) {
        SODLYoutubeManager.moveVideo(videoId, folderId);
      }
    });
  }
}
