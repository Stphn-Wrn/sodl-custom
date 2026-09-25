import { test } from "node:test";
import assert from "node:assert/strict";
import {
  createEmptyLibrary,
  addFolder,
  renameFolder,
  removeFolder,
  addVideo,
  renameVideo,
  moveVideo,
  removeVideo,
  buildLibraryView
} from "../../src/features/youtube-player/library.js";

test("ajoute un dossier avec un nom nettoyé", () => {
  const library = createEmptyLibrary();
  const result = addFolder(library, "  Ambiances  ", "f1");
  assert.deepEqual(result.folders, [{ id: "f1", name: "Ambiances" }]);
  assert.deepEqual(library.folders, [], "la bibliothèque d'origine n'est pas modifiée");
});

test("refuse un nom de dossier vide", () => {
  const library = createEmptyLibrary();
  assert.throws(() => addFolder(library, "   ", "f1"));
});

test("renomme un dossier existant", () => {
  const library = { folders: [{ id: "f1", name: "Ancien" }], videos: [] };
  const result = renameFolder(library, "f1", "Nouveau");
  assert.deepEqual(result.folders, [{ id: "f1", name: "Nouveau" }]);
});

test("supprimer un dossier déplace ses vidéos dans « Non classé »", () => {
  const library = {
    folders: [{ id: "f1", name: "Combat" }, { id: "f2", name: "Taverne" }],
    videos: [
      { id: "v1", title: "Boss", videoId: "aaaaaaaaaaa", folderId: "f1" },
      { id: "v2", title: "Chants", videoId: "bbbbbbbbbbb", folderId: "f2" }
    ]
  };
  const result = removeFolder(library, "f1");
  assert.deepEqual(result.folders, [{ id: "f2", name: "Taverne" }]);
  assert.deepEqual(result.videos, [
    { id: "v1", title: "Boss", videoId: "aaaaaaaaaaa", folderId: null },
    { id: "v2", title: "Chants", videoId: "bbbbbbbbbbb", folderId: "f2" }
  ]);
});

test("ajoute une vidéo dans un dossier", () => {
  const library = { folders: [{ id: "f1", name: "Combat" }], videos: [] };
  const result = addVideo(library, { title: " Boss ", videoId: "aaaaaaaaaaa", folderId: "f1" }, "v1");
  assert.deepEqual(result.videos, [{ id: "v1", title: "Boss", videoId: "aaaaaaaaaaa", folderId: "f1" }]);
});

test("une vidéo ajoutée dans un dossier inexistant va dans « Non classé »", () => {
  const library = createEmptyLibrary();
  const result = addVideo(library, { title: "Boss", videoId: "aaaaaaaaaaa", folderId: "inconnu" }, "v1");
  assert.equal(result.videos[0].folderId, null);
});

test("refuse une vidéo sans ID YouTube", () => {
  const library = createEmptyLibrary();
  assert.throws(() => addVideo(library, { title: "Boss", videoId: "", folderId: null }, "v1"));
});

test("renomme, déplace et supprime une vidéo", () => {
  const library = {
    folders: [{ id: "f1", name: "Combat" }],
    videos: [{ id: "v1", title: "Boss", videoId: "aaaaaaaaaaa", folderId: null }]
  };

  const renamed = renameVideo(library, "v1", "Boss final");
  assert.equal(renamed.videos[0].title, "Boss final");

  const moved = moveVideo(renamed, "v1", "f1");
  assert.equal(moved.videos[0].folderId, "f1");

  const removed = removeVideo(moved, "v1");
  assert.deepEqual(removed.videos, []);
});

test("construit une vue triée par dossier avec « Non classé » en dernier", () => {
  const library = {
    folders: [{ id: "f2", name: "Taverne" }, { id: "f1", name: "Combat" }],
    videos: [
      { id: "v1", title: "Zombie", videoId: "aaaaaaaaaaa", folderId: "f1" },
      { id: "v2", title: "Araignée", videoId: "bbbbbbbbbbb", folderId: "f1" },
      { id: "v3", title: "Orage", videoId: "ccccccccccc", folderId: null }
    ]
  };
  const view = buildLibraryView(library);
  assert.deepEqual(
    view.map((group) => ({ id: group.id, videos: group.videos.map((video) => video.id) })),
    [
      { id: "f1", videos: ["v2", "v1"] },
      { id: "f2", videos: [] },
      { id: null, videos: ["v3"] }
    ]
  );
});

test("la vue omet « Non classé » lorsqu'il est vide", () => {
  const library = { folders: [{ id: "f1", name: "Combat" }], videos: [] };
  const view = buildLibraryView(library);
  assert.deepEqual(view.map((group) => group.id), ["f1"]);
});
