import { test } from "node:test";
import assert from "node:assert/strict";
import { formatTime } from "../../src/features/youtube-player/time-format.js";

test("formate les durées courtes en m:ss", () => {
  assert.equal(formatTime(3), "0:03");
  assert.equal(formatTime(341.9), "5:41");
});

test("formate les durées d'une heure ou plus en h:mm:ss", () => {
  assert.equal(formatTime(3725), "1:02:05");
});

test("une valeur invalide ou négative s'affiche 0:00", () => {
  assert.equal(formatTime(NaN), "0:00");
  assert.equal(formatTime(-5), "0:00");
  assert.equal(formatTime(undefined), "0:00");
});
