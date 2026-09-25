import { MODULE_ID, modulePath } from "../../shared/constants.js";
import { renderTemplate, escapeHTML } from "../../shared/foundry-adapter.js";
import { SODLYoutubeManager } from "./library-manager.js";
import { SODLYoutubeBroadcast } from "./broadcast-manager.js";
import { UNSORTED_FOLDER_NAME } from "./library.js";
import { SYNC_TOLERANCE } from "./broadcast.js";
import { loadYoutubeIframeApi } from "./iframe-api.js";
import { promptFolderName, promptVideo, confirmRemoval } from "./library-dialogs.js";

export const LIBRARY_TEMPLATE = modulePath("src/features/youtube-player/library.html");
const WIDGET_TEMPLATE = modulePath("src/features/youtube-player/widget.html");
const SYNC_INTERVAL_MS = 1000;
// Délai après lequel on propose aux joueurs de cliquer si le navigateur a bloqué la lecture auto.
const AUTOPLAY_BLOCKED_DELAY_MS = 2500;
// En dessous de ce déplacement (px), un appui sur la pastille est un clic et non un glisser.
const DRAG_THRESHOLD_PX = 4;
const MIN_WIDTH = 280;
const MAX_WIDTH = 960;

// Valeurs de YT.PlayerState, dupliquées pour ne pas dépendre du chargement de l'API.
const PLAYER_STATE = { UNSTARTED: -1, ENDED: 0, PLAYING: 1, PAUSED: 2, BUFFERING: 3, CUED: 5 };


/**
 * Widget flottant de diffusion YouTube, présent en permanence quand l'outil est activé.
 *
 * - Le MJ dispose de la bibliothèque et d'un lecteur complet : ce qu'il fait
 *   (lancer, mettre en pause, avancer...) est diffusé à tout le monde.
 * - Les joueurs voient un lecteur verrouillé qui suit la diffusion, avec un
 *   volume local. Le widget n'apparaît chez eux que pendant une diffusion.
 *
 * Réduire le widget le transforme en pastille sans couper la vidéo. Position,
 * largeur et état réduit sont mémorisés pour chaque client.
 */
export class SODLYoutubeWidget {
  static instance = null;

  static mount() {
    if (!this.instance) {
      this.instance = new SODLYoutubeWidget();
      this.instance.render();
    }
    return this.instance;
  }

  static onBroadcastChanged() {
    if (this.instance) {
      this.instance.syncBroadcast();
    }
  }

  static onLibraryChanged() {
    if (this.instance) {
      this.instance.refreshLibrary();
    }
  }

  constructor() {
    this.element = null;
    this.player = null;
    this._playerReady = false;
    this._loadedVideoId = null;
    this._playRequestedAt = null;
    this._activeLibraryVideoId = null;
    this._syncInterval = null;
    this.layout = this._loadLayout();
    // Dossiers repliés : état local à chaque client, non partagé.
    this.collapsedFolders = new Set();
  }

  async render() {
    const data = this._getLibraryData();
    data.volume = game.settings.get(MODULE_ID, "youtubeVolume");
    const html = await renderTemplate(WIDGET_TEMPLATE, data);
    this.element = $(html);
    $(document.body).append(this.element);

    this._applyLayout();
    this._activateListeners();
    this._activateLibraryListeners(this.element.find(".yt-library"));
    this._updateChrome(SODLYoutubeBroadcast.getState());
    this._mountPlayer();
  }

  // -------- Disposition (position, largeur, réduit) --------

  _loadLayout() {
    const defaults = { left: null, top: 90, width: 380, collapsed: false, libraryOpen: true };
    return foundry.utils.mergeObject(defaults, game.settings.get(MODULE_ID, "youtubeWidgetLayout") ?? {});
  }

  _saveLayout() {
    game.settings.set(MODULE_ID, "youtubeWidgetLayout", this.layout);
  }

  _applyLayout() {
    const el = this.element[0];
    el.classList.toggle("yt-widget-collapsed", this.layout.collapsed);
    el.classList.toggle("yt-widget-library-open", this.layout.libraryOpen);
    el.style.width = `${this.layout.width}px`;

    // Première ouverture : à gauche de la barre latérale.
    if (this.layout.left === null) {
      this.layout.left = window.innerWidth - this.layout.width - 340;
    }
    this._moveTo(this.layout.left, this.layout.top);
  }

  // Place le widget en le gardant toujours visible dans la fenêtre.
  _moveTo(left, top) {
    const el = this.element[0];
    const maxLeft = Math.max(0, window.innerWidth - el.offsetWidth);
    const maxTop = Math.max(0, window.innerHeight - el.offsetHeight);
    this.layout.left = Math.min(Math.max(0, left), maxLeft);
    this.layout.top = Math.min(Math.max(0, top), maxTop);
    el.style.left = `${this.layout.left}px`;
    el.style.top = `${this.layout.top}px`;
  }

  _setCollapsed(collapsed) {
    this.layout.collapsed = collapsed;
    this.element.toggleClass("yt-widget-collapsed", collapsed);
    this._moveTo(this.layout.left, this.layout.top);
    this._saveLayout();
  }

  /**
   * Rend un élément « poignée » capable de déplacer le widget. `onClick` est
   * appelé si l'utilisateur a simplement cliqué sans glisser.
   */
  _makeDragHandle(handle, onClick = null) {
    handle.on("pointerdown", (event) => {
      if (event.button !== 0 || $(event.target).closest(".yt-widget-icon").length) {
        return;
      }
      const startX = event.clientX;
      const startY = event.clientY;
      const origin = { left: this.layout.left, top: this.layout.top };
      let dragging = false;

      const onMove = (moveEvent) => {
        const dx = moveEvent.clientX - startX;
        const dy = moveEvent.clientY - startY;
        if (!dragging && Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) {
          return;
        }
        dragging = true;
        // L'iframe capterait le pointeur pendant le glisser : on la neutralise.
        this.element.addClass("yt-widget-dragging");
        this._moveTo(origin.left + dx, origin.top + dy);
      };

      const onUp = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        this.element.removeClass("yt-widget-dragging");
        if (dragging) {
          this._saveLayout();
          return;
        }
        if (onClick) {
          onClick();
        }
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    });
  }

  _activateListeners() {
    const html = this.element;

    this._makeDragHandle(html.find(".yt-widget-header"));
    this._makeDragHandle(html.find(".yt-widget-pill"), () => this._setCollapsed(false));
    html.find(".yt-collapse").on("click", () => this._setCollapsed(true));

    html.find(".yt-toggle-library").on("click", () => {
      this.layout.libraryOpen = !this.layout.libraryOpen;
      html.toggleClass("yt-widget-library-open", this.layout.libraryOpen);
      this._moveTo(this.layout.left, this.layout.top);
      this._saveLayout();
    });

    // Largeur redimensionnable via la poignée CSS (resize: horizontal).
    html.on("pointerup", () => {
      const width = Math.round(html[0].offsetWidth);
      if (this.layout.collapsed || width === this.layout.width) {
        return;
      }
      this.layout.width = Math.min(Math.max(MIN_WIDTH, width), MAX_WIDTH);
      this._saveLayout();
    });

    window.addEventListener("resize", () => this._moveTo(this.layout.left, this.layout.top));

    html.find(".yt-stop-broadcast").on("click", () => SODLYoutubeBroadcast.stop());

    html.find(".yt-volume input").on("input", (event) => {
      const volume = Number(event.currentTarget.value);
      if (this._playerReady) {
        this.player.setVolume(volume);
      }
      game.settings.set(MODULE_ID, "youtubeVolume", volume);
    });

    html.find(".yt-join").on("click", () => {
      this._playRequestedAt = Date.now();
      this._setJoinButtonVisible(false);
      if (this._playerReady) {
        this.player.playVideo();
      }
    });
  }

  // -------- Lecteur --------

  async _mountPlayer() {
    const target = this.element.find(".yt-player-target")[0];

    let YT;
    try {
      YT = await loadYoutubeIframeApi();
    } catch (err) {
      ui.notifications.error(err.message);
      return;
    }

    const isGM = game.user.isGM;
    let controls = 0;
    let disablekb = 1;
    if (isGM) {
      controls = 1;
      disablekb = 0;
    }

    this.player = new YT.Player(target, {
      width: "100%",
      height: "100%",
      playerVars: { controls, disablekb, rel: 0, playsinline: 1, modestbranding: 1, origin: window.location.origin },
      events: {
        onReady: () => {
          this._playerReady = true;
          if (!isGM) {
            this.player.setVolume(game.settings.get(MODULE_ID, "youtubeVolume"));
          }
          this.syncBroadcast();
          this._syncInterval = setInterval(() => this._tick(), SYNC_INTERVAL_MS);
        },
        onStateChange: () => {
          if (isGM) {
            this._reportGmPlayback();
          }
        }
      }
    });
  }

  _tick() {
    if (game.user.isGM) {
      // L'API YouTube n'émet pas d'événement lors d'un saut dans la vidéo :
      // on compare régulièrement la position du MJ à celle diffusée.
      this._reportGmPlayback();
      return;
    }
    this.syncBroadcast();
  }

  /**
   * Aligne l'affichage et le lecteur local sur l'état diffusé.
   * Le MJ ne charge que la vidéo (il est la source de la lecture) ;
   * les joueurs suivent aussi la lecture/pause et la position.
   */
  syncBroadcast() {
    const state = SODLYoutubeBroadcast.getState();
    this._updateChrome(state);
    if (!this._playerReady) {
      return;
    }

    if (!state.video) {
      if (this._loadedVideoId) {
        this.player.stopVideo();
        this._loadedVideoId = null;
      }
      this._setJoinButtonVisible(false);
      return;
    }

    const position = SODLYoutubeBroadcast.expectedPosition(state);
    if (state.video.videoId !== this._loadedVideoId) {
      this._loadedVideoId = state.video.videoId;
      if (state.playing) {
        this.player.loadVideoById({ videoId: state.video.videoId, startSeconds: position });
        this._playRequestedAt = Date.now();
      } else {
        this.player.cueVideoById({ videoId: state.video.videoId, startSeconds: position });
      }
      return;
    }

    if (!game.user.isGM) {
      this._followBroadcast(state, position);
    }
  }

  _followBroadcast(state, position) {
    const playerState = this.player.getPlayerState();
    const isPlaying = playerState === PLAYER_STATE.PLAYING || playerState === PLAYER_STATE.BUFFERING;

    // La vidéo s'est terminée un peu avant celle du MJ : on attend sans la relancer.
    const endedWithBroadcast = playerState === PLAYER_STATE.ENDED
      && Math.abs(this.player.getCurrentTime() - position) <= SYNC_TOLERANCE;
    if (endedWithBroadcast) {
      this._setJoinButtonVisible(false);
      return;
    }

    if (state.playing && !isPlaying) {
      if (!this._playRequestedAt) {
        this._playRequestedAt = Date.now();
      }
      this.player.playVideo();
    }
    if (state.playing && isPlaying) {
      this._playRequestedAt = null;
    }
    if (!state.playing && isPlaying) {
      this.player.pauseVideo();
    }

    // Un lecteur simplement "préparé" (cued) est déjà à la bonne position :
    // y appeler seekTo lancerait la lecture.
    const canSeek = playerState !== PLAYER_STATE.CUED && playerState !== PLAYER_STATE.UNSTARTED;
    if (canSeek && Math.abs(this.player.getCurrentTime() - position) > SYNC_TOLERANCE) {
      this.player.seekTo(position, true);
    }

    // Si le navigateur bloque la lecture automatique, on propose un bouton à cliquer.
    let blocked = false;
    if (state.playing && !isPlaying && this._playRequestedAt) {
      blocked = Date.now() - this._playRequestedAt > AUTOPLAY_BLOCKED_DELAY_MS;
    }
    this._setJoinButtonVisible(blocked);
  }

  // Transmet l'état du lecteur du MJ. Les états transitoires (chargement, mise en
  // mémoire tampon) sont ignorés pour ne pas diffuser de fausses pauses.
  _reportGmPlayback() {
    if (!this._playerReady) {
      return;
    }
    const state = SODLYoutubeBroadcast.getState();
    if (!state.video || state.video.videoId !== this._loadedVideoId) {
      return;
    }
    const playerState = this.player.getPlayerState();
    const position = this.player.getCurrentTime();
    if (playerState === PLAYER_STATE.PLAYING) {
      SODLYoutubeBroadcast.report({ playing: true, position });
      return;
    }
    if (playerState === PLAYER_STATE.PAUSED || playerState === PLAYER_STATE.ENDED) {
      SODLYoutubeBroadcast.report({ playing: false, position });
    }
  }

  _updateChrome(state) {
    if (!this.element) {
      return;
    }
    const live = Boolean(state.video);
    this.element.toggleClass("yt-widget-live", live);
    // Hors diffusion, le widget disparaît chez les joueurs (il reste monté pour être prêt).
    this.element.toggleClass("yt-widget-hidden", !live && !game.user.isGM);

    let title = "Lecteur YouTube";
    if (live) {
      title = state.video.title;
    }
    this.element.find(".yt-widget-title").text(title);
    this.element.find(".yt-widget-pill").attr("title", title);

    const activeId = state.video?.id ?? null;
    if (activeId !== this._activeLibraryVideoId) {
      this.refreshLibrary();
    }
  }

  _setJoinButtonVisible(visible) {
    if (!this.element) {
      return;
    }
    this.element.find(".yt-join").toggleClass("yt-join-visible", visible);
  }

  // -------- Bibliothèque (MJ) --------

  _getLibraryData() {
    const activeId = SODLYoutubeBroadcast.getState().video?.id;
    this._activeLibraryVideoId = activeId ?? null;
    const groups = SODLYoutubeManager.getLibraryView().map((group) => ({
      ...group,
      collapsed: this.collapsedFolders.has(group.id ?? ""),
      videos: group.videos.map((video) => ({ ...video, active: video.id === activeId }))
    }));
    return { isGM: game.user.isGM, groups };
  }

  // Re-rend uniquement la bibliothèque, sans toucher au lecteur.
  async refreshLibrary() {
    if (!this.element || !game.user.isGM) {
      return;
    }
    const html = await renderTemplate(LIBRARY_TEMPLATE, this._getLibraryData());
    const library = $(html);
    this.element.find(".yt-library").replaceWith(library);
    this._activateLibraryListeners(library);
  }

  _activateLibraryListeners(html) {
    html.find(".yt-folder-header").on("click", (event) => {
      if ($(event.target).closest("a").length) {
        return;
      }
      const folder = $(event.currentTarget).closest(".yt-folder");
      const key = folder.attr("data-folder-id") ?? "";
      folder.toggleClass("yt-folder-collapsed");
      if (folder.hasClass("yt-folder-collapsed")) {
        this.collapsedFolders.add(String(key));
      } else {
        this.collapsedFolders.delete(String(key));
      }
    });

    if (!game.user.isGM) {
      return;
    }

    html.find(".yt-video").on("click", (event) => {
      if ($(event.target).closest("a").length) {
        return;
      }
      const video = SODLYoutubeManager.findVideo($(event.currentTarget).attr("data-video-id"));
      if (video) {
        SODLYoutubeBroadcast.start(video);
      }
    });

    html.find(".yt-add-folder").on("click", () => promptFolderName("Nouveau dossier", "", (name) => SODLYoutubeManager.addFolder(name)));
    html.find(".yt-add-video").on("click", () => promptVideo());

    html.find(".yt-rename-folder").on("click", (event) => {
      const folderEl = $(event.currentTarget).closest(".yt-folder");
      const folderId = folderEl.attr("data-folder-id");
      const currentName = folderEl.find(".yt-folder-name").text();
      promptFolderName("Renommer le dossier", currentName, (name) => SODLYoutubeManager.renameFolder(folderId, name));
    });

    html.find(".yt-remove-folder").on("click", (event) => {
      const folderEl = $(event.currentTarget).closest(".yt-folder");
      const name = escapeHTML(folderEl.find(".yt-folder-name").text());
      confirmRemoval(
        "Supprimer le dossier",
        `<p>Supprimer le dossier <strong>${name}</strong> ? Ses vidéos seront déplacées dans « ${UNSORTED_FOLDER_NAME} ».</p>`,
        () => SODLYoutubeManager.removeFolder(folderEl.attr("data-folder-id"))
      );
    });

    html.find(".yt-edit-video").on("click", (event) => {
      const video = SODLYoutubeManager.findVideo($(event.currentTarget).closest(".yt-video").attr("data-video-id"));
      if (video) {
        promptVideo(video);
      }
    });

    html.find(".yt-remove-video").on("click", (event) => {
      const video = SODLYoutubeManager.findVideo($(event.currentTarget).closest(".yt-video").attr("data-video-id"));
      if (!video) {
        return;
      }
      confirmRemoval(
        "Supprimer la vidéo",
        `<p>Supprimer la vidéo <strong>${escapeHTML(video.title)}</strong> de la bibliothèque ?</p>`,
        () => SODLYoutubeManager.removeVideo(video.id)
      );
    });
  }
}
