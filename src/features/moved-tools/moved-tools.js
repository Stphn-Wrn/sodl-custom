import { MODULE_ID } from "../../shared/constants.js";

// The dice clock and the YouTube player became standalone modules; their data
// stays in the world under this module's settings until those modules import it.
export const MOVED_TOOLS = {
  diceClock: { settingPrefix: "diceClock", module: "dice-clock" },
  youtubePlayer: { settingPrefix: "youtube", module: "synced-youtube-player" }
};

export function movedToolsInUse(storedKeys) {
  return Object.entries(MOVED_TOOLS)
    .filter(([, tool]) => storedKeys.some((key) => key.startsWith(`${MODULE_ID}.${tool.settingPrefix}`)))
    .map(([name]) => name);
}
