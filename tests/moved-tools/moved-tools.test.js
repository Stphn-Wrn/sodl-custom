import { test } from "node:test";
import assert from "node:assert/strict";
import { movedToolsInUse } from "../../src/features/moved-tools/moved-tools.js";

test("lists the moved tools the world has data for", () => {
  const storedKeys = ["sodl-companion.chancePoints", "sodl-companion.diceClockState", "sodl-companion.youtubeLibrary", "core.time"];

  assert.deepEqual(movedToolsInUse(storedKeys), ["diceClock", "youtubePlayer"]);
});

test("a world that never used them needs no notice", () => {
  const storedKeys = ["sodl-companion.chancePoints", "sodl-companion.combatHudLayout"];

  assert.deepEqual(movedToolsInUse(storedKeys), []);
});

test("another module's settings with a similar name do not count", () => {
  const storedKeys = ["dice-clock.diceClockState", "synced-youtube-player.youtubeLibrary"];

  assert.deepEqual(movedToolsInUse(storedKeys), []);
});
