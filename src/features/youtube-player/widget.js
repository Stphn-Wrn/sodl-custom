import { MODULE_ID, modulePath } from "../../shared/constants.js";
import { renderTemplate } from "../../shared/foundry-adapter.js";
import { SODLYoutubeBroadcast } from "./broadcast-manager.js";
import { SYNC_TOLERANCE } from "./broadcast.js";
import { loadYoutubeIframeApi } from "./iframe-api.js";
import { SODLYoutubeLibraryPanel } from "./library-panel.js";
import { formatTime } from "./time-format.js";

const WIDGET_TEMPLATE = modulePath("src/features/youtube-player/widget.html");
const SYNC_INTERVAL_MS = 1000;
// Rafraîchissement de la barre de progression et du temps affiché.
const PROGRESS_INTERVAL_MS = 250;
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
 * L'interface YouTube est masquée : le widget fournit ses propres contrôles.
 * - Le MJ dispose de la recherche, de la bibliothèque et des contrôles de
 *   lecture : ce qu'il fait (lancer, mettre en pause, avancer...) est diffusé
 *   à tout le monde.
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
    if (this.instance?.libraryPanel) {
      this.instance.libraryPanel.refresh();
    }
  }

  constructor() {
    this.element = null;
    this.player = null;
    this._playerReady = false;
    this._loadedVideoId = null;
    this._playRequestedAt = null;
    this._seeking = false;
    this.libraryPanel = null;
    this.layout = this._loadLayout();
  }

  async render() {
    const data = {
      isGM: game.user.isGM,
      volume: game.settings.get(MODULE_ID, "youtubeVolume"),
      // Le partial de la bibliothèque est rendu vide puis rempli par le panneau.
      groups: []
    };
    const html = await renderTemplate(WIDGET_TEMPLATE, data);
    this.element = $(html);
    $(document.body).append(this.element);

    this._applyLayout();
    this._activateListeners();
    this._updateVolumeDisplay(data.volume);
    if (game.user.isGM) {
      this.libraryPanel = new SODLYoutubeLibraryPanel(this.element.find(".yt-widget-library"));
      this.libraryPanel.refresh();
    }
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
      this._updateVolumeDisplay(volume);
    });
    html.find(".yt-volume input").on("change", (event) => {
      game.settings.set(MODULE_ID, "youtubeVolume", Number(event.currentTarget.value));
    });

    html.find(".yt-fullscreen").on("click", () => this._toggleFullscreen());

    if (game.user.isGM) {
      html.find(".yt-play-toggle, .yt-player-shield").on("click", () => this._togglePlayback());

      // Pendant le glisser, seul l'affichage suit ; la vidéo saute au relâchement.
      html.find(".yt-seek").on("input", (event) => {
        this._seeking = true;
        html.find(".yt-time-current").text(formatTime(event.currentTarget.value));
      });
      html.find(".yt-seek").on("change", (event) => {
        this._seeking = false;
        if (this._playerReady) {
          this.player.seekTo(Number(event.currentTarget.value), true);
          this._reportGmPlayback();
        }
      });
    }

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
    this.player = new YT.Player(target, {
      width: "100%",
      height: "100%",
      playerVars: { controls: 0, disablekb: 1, rel: 0, playsinline: 1, iv_load_policy: 3, fs: 0, origin: window.location.origin },
      events: {
        onReady: () => {
          this._playerReady = true;
          this.player.setVolume(game.settings.get(MODULE_ID, "youtubeVolume"));
          this.syncBroadcast();
          setInterval(() => this._tick(), SYNC_INTERVAL_MS);
          setInterval(() => this._updateProgress(), PROGRESS_INTERVAL_MS);
        },
        onStateChange: () => {
          this._updateProgress();
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

    if (this.libraryPanel) {
      this.libraryPanel.onBroadcastChanged();
    }
  }

  // -------- Contrôles du module --------

  _togglePlayback() {
    if (!this._playerReady || !SODLYoutubeBroadcast.getState().video) {
      return;
    }
    const playerState = this.player.getPlayerState();
    if (playerState === PLAYER_STATE.PLAYING || playerState === PLAYER_STATE.BUFFERING) {
      this.player.pauseVideo();
      return;
    }
    this.player.playVideo();
  }

  _toggleFullscreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen();
      return;
    }
    this.element.find(".yt-widget-screen")[0].requestFullscreen?.();
  }

  // Met à jour la barre de progression, le temps et l'icône lecture/pause.
  _updateProgress() {
    if (!this._playerReady || !this.element) {
      return;
    }
    const duration = this.player.getDuration() || 0;
    const current = this.player.getCurrentTime() || 0;
    const seek = this.element.find(".yt-seek");
    seek.attr("max", duration);
    if (!this._seeking) {
      seek.val(current);
      this.element.find(".yt-time-current").text(formatTime(current));
    }
    this.element.find(".yt-time-total").text(formatTime(duration));
    let percent = 0;
    if (duration > 0) {
      percent = (Number(seek.val()) / duration) * 100;
    }
    seek[0].style.setProperty("--yt-progress", `${percent}%`);

    const playerState = this.player.getPlayerState();
    const playing = playerState === PLAYER_STATE.PLAYING || playerState === PLAYER_STATE.BUFFERING;
    this.element.toggleClass("yt-widget-playing", playing);
    this.element.find(".yt-play-toggle i")
      .toggleClass("fa-play", !playing)
      .toggleClass("fa-pause", playing);
  }

  _updateVolumeDisplay(volume) {
    let icon = "fa-volume-high";
    if (volume === 0) {
      icon = "fa-volume-xmark";
    } else if (volume < 50) {
      icon = "fa-volume-low";
    }
    this.element.find(".yt-volume i").attr("class", `fas ${icon}`);
    this.element.find(".yt-volume input")[0].style.setProperty("--yt-progress", `${volume}%`);
  }

  _setJoinButtonVisible(visible) {
    if (!this.element) {
      return;
    }
    this.element.find(".yt-join").toggleClass("yt-join-visible", visible);
  }
}
