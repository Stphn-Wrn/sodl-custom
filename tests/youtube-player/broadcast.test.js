import { test } from "node:test";
import assert from "node:assert/strict";
import {
  createIdleBroadcast,
  startBroadcast,
  updatePlayback,
  expectedPosition,
  hasDiverged
} from "../../src/features/youtube-player/broadcast.js";

test("une diffusion au repos n'a pas de vidéo", () => {
  const expected = { video: null, playing: false, position: 0, updatedAt: 0 };
  assert.deepEqual(createIdleBroadcast(), expected);
});

test("lancer une diffusion démarre la vidéo au début", () => {
  const video = { id: "v1", title: "Boss", videoId: "aaaaaaaaaaa", folderId: "f1" };
  const result = startBroadcast(video, 1000);
  assert.deepEqual(result, {
    video: { id: "v1", title: "Boss", videoId: "aaaaaaaaaaa" },
    playing: true,
    position: 0,
    updatedAt: 1000
  });
});

test("met à jour la lecture en conservant la vidéo", () => {
  const state = { video: { id: "v1", title: "Boss", videoId: "aaaaaaaaaaa" }, playing: true, position: 0, updatedAt: 1000 };
  const result = updatePlayback(state, { playing: false, position: 12.5 }, 5000);
  assert.deepEqual(result, { video: state.video, playing: false, position: 12.5, updatedAt: 5000 });
});

test("la position attendue avance avec le temps pendant la lecture", () => {
  const state = { video: { id: "v1", title: "Boss", videoId: "aaaaaaaaaaa" }, playing: true, position: 10, updatedAt: 1000 };
  assert.equal(expectedPosition(state, 4000), 13);
});

test("la position attendue reste figée en pause", () => {
  const state = { video: { id: "v1", title: "Boss", videoId: "aaaaaaaaaaa" }, playing: false, position: 10, updatedAt: 1000 };
  assert.equal(expectedPosition(state, 60000), 10);
});

test("détecte une divergence de lecture/pause", () => {
  const state = { video: { id: "v1", title: "Boss", videoId: "aaaaaaaaaaa" }, playing: true, position: 10, updatedAt: 1000 };
  assert.equal(hasDiverged(state, { playing: false, position: 10 }, 1000), true);
});

test("détecte un saut dans la vidéo au-delà de la tolérance", () => {
  const state = { video: { id: "v1", title: "Boss", videoId: "aaaaaaaaaaa" }, playing: true, position: 10, updatedAt: 1000 };
  assert.equal(hasDiverged(state, { playing: true, position: 60 }, 2000), true);
});

test("ignore les petits écarts de position", () => {
  const state = { video: { id: "v1", title: "Boss", videoId: "aaaaaaaaaaa" }, playing: true, position: 10, updatedAt: 1000 };
  assert.equal(hasDiverged(state, { playing: true, position: 11.8 }, 2000), false);
});

test("aucune divergence sans diffusion en cours", () => {
  const state = { video: null, playing: false, position: 0, updatedAt: 0 };
  assert.equal(hasDiverged(state, { playing: true, position: 42 }, 2000), false);
});
