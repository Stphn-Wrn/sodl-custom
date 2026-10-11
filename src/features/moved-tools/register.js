import { MODULE_ID } from "../../shared/constants.js";
import { t } from "../../shared/foundry-adapter.js";
import { MOVED_TOOLS, movedToolsInUse } from "./moved-tools.js";

const NOTICE_SETTING = "movedToolsNoticeShown";

function manifestUrl(module) {
  return `https://raw.githubusercontent.com/Stphn-Wrn/${module}/main/module.json`;
}

function noticeContent(tools) {
  const items = tools
    .map((name) => {
      const tool = MOVED_TOOLS[name];
      return `<li><strong>${t(`SODL.MovedTools.${name}`)}</strong><br><code>${manifestUrl(tool.module)}</code></li>`;
    })
    .join("");
  return `<h3><i class="fas fa-box-open"></i> ${t("SODL.MovedTools.Title")}</h3><p>${t("SODL.MovedTools.Body")}</p><ul>${items}</ul>`;
}

// Tells the GM once where the tools went, only in worlds that used them.
export const movedToolsFeature = {
  init() {
    game.settings.register(MODULE_ID, NOTICE_SETTING, { scope: "world", config: false, type: Boolean, default: false });
  },

  async ready() {
    if (game.users.activeGM?.id !== game.user.id || game.settings.get(MODULE_ID, NOTICE_SETTING)) {
      return;
    }
    const storedKeys = game.settings.storage.get("world").map((setting) => setting.key);
    const tools = movedToolsInUse(storedKeys).filter((name) => !game.modules.get(MOVED_TOOLS[name].module)?.active);
    if (tools.length > 0) {
      await ChatMessage.create({ content: noticeContent(tools), whisper: ChatMessage.getWhisperRecipients("GM") });
    }
    await game.settings.set(MODULE_ID, NOTICE_SETTING, true);
  }
};
