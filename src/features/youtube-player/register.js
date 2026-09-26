import { MODULE_ID } from "../../shared/constants.js";
import { loadTemplates } from "../../shared/foundry-adapter.js";
import { SODLYoutubeManager } from "./library-manager.js";
import { SODLYoutubeBroadcast } from "./broadcast-manager.js";
import { SODLYoutubeSearch } from "./search-service.js";
import { SODLYoutubeWidget } from "./widget.js";
import { LIBRARY_TEMPLATE } from "./library-panel.js";

function isEnabled() {
  return game.settings.get(MODULE_ID, "youtubePlayerEnabled");
}

export const youtubePlayerFeature = {
  init() {
    window.SODLYoutubeManager = SODLYoutubeManager;
    window.SODLYoutubeBroadcast = SODLYoutubeBroadcast;
    window.SODLYoutubeWidget = SODLYoutubeWidget;
    window.SODLYoutubeSearch = SODLYoutubeSearch;

    game.settings.register(MODULE_ID, "youtubePlayerEnabled", {
      name: "SODL.Settings.YoutubePlayerEnabled.Name",
      hint: "SODL.Settings.YoutubePlayerEnabled.Hint",
      scope: "world",
      config: true,
      type: Boolean,
      default: false,
      requiresReload: true
    });

    game.settings.register(MODULE_ID, "youtubeApiKey", {
      name: "SODL.Settings.YoutubeApiKey.Name",
      hint: "SODL.Settings.YoutubeApiKey.Hint",
      scope: "world",
      config: true,
      type: String,
      default: ""
    });

    game.settings.register(MODULE_ID, "youtubeInvidiousInstances", {
      name: "SODL.Settings.YoutubeInvidiousInstances.Name",
      hint: "SODL.Settings.YoutubeInvidiousInstances.Hint",
      scope: "world",
      config: true,
      type: String,
      default: "https://inv.nadeko.net, https://yewtu.be, https://invidious.nerdvpn.de"
    });

    game.settings.register(MODULE_ID, "youtubeLibrary", {
      scope: "world",
      config: false,
      type: Object,
      default: { folders: [], videos: [] },
      onChange: () => SODLYoutubeWidget.onLibraryChanged()
    });

    game.settings.register(MODULE_ID, "youtubeBroadcast", {
      scope: "world",
      config: false,
      type: Object,
      default: { video: null, playing: false, position: 0, updatedAt: 0 },
      onChange: () => SODLYoutubeWidget.onBroadcastChanged()
    });

    game.settings.register(MODULE_ID, "youtubeVolume", {
      scope: "client",
      config: false,
      type: Number,
      default: 80
    });

    game.settings.register(MODULE_ID, "youtubeWidgetLayout", {
      scope: "client",
      config: false,
      type: Object,
      default: {}
    });

    loadTemplates([LIBRARY_TEMPLATE]);
  },

  ready() {
    if (isEnabled()) {
      SODLYoutubeWidget.mount();
    }
  }
};
