import { test } from "node:test";
import assert from "node:assert/strict";
import {
  classifyQuery,
  parseDataApiResults,
  parseInvidiousResults,
  createSearchProvider
} from "../../src/features/youtube-player/search.js";

function fakeResponse(body, ok = true) {
  return { ok, status: ok ? 200 : 500, json: async () => body };
}

test("un lien YouTube est reconnu comme un lien direct", () => {
  const input = "  https://youtu.be/dQw4w9WgXcQ?si=abc ";
  const expected = { kind: "link", videoId: "dQw4w9WgXcQ" };
  assert.deepEqual(classifyQuery(input), expected);
});

test("un texte libre est une recherche", () => {
  const input = "  musique taverne médiévale ";
  const expected = { kind: "text", text: "musique taverne médiévale" };
  assert.deepEqual(classifyQuery(input), expected);
});

test("un mot de 11 lettres est une recherche, pas un ID", () => {
  const input = "dragonsongs";
  const expected = { kind: "text", text: "dragonsongs" };
  assert.deepEqual(classifyQuery(input), expected);
});

test("plusieurs liens, un par ligne, forment une liste sans doublon", () => {
  const input = "https://youtu.be/aaaaaaaaaaa\n  https://www.youtube.com/watch?v=bbbbbbbbbbb&t=4s\r\n\nhttps://youtu.be/aaaaaaaaaaa";
  const expected = { kind: "links", videoIds: ["aaaaaaaaaaa", "bbbbbbbbbbb"] };
  assert.deepEqual(classifyQuery(input), expected);
});

test("des liens séparés par des espaces ou des virgules forment aussi une liste", () => {
  const input = "https://youtu.be/aaaaaaaaaaa, https://youtu.be/bbbbbbbbbbb https://youtu.be/ccccccccccc";
  const expected = { kind: "links", videoIds: ["aaaaaaaaaaa", "bbbbbbbbbbb", "ccccccccccc"] };
  assert.deepEqual(classifyQuery(input), expected);
});

test("les lignes qui ne sont pas des liens YouTube sont ignorées dans une liste", () => {
  const input = "Ambiances :\nhttps://youtu.be/aaaaaaaaaaa\nhttps://example.com/page\nhttps://youtu.be/bbbbbbbbbbb";
  const expected = { kind: "links", videoIds: ["aaaaaaaaaaa", "bbbbbbbbbbb"] };
  assert.deepEqual(classifyQuery(input), expected);
});

test("une saisie vide ne déclenche rien", () => {
  assert.deepEqual(classifyQuery("   "), { kind: "empty" });
  assert.deepEqual(classifyQuery(undefined), { kind: "empty" });
});

test("normalise les résultats de l'API YouTube Data et décode le HTML", () => {
  const body = {
    items: [
      { id: { videoId: "aaaaaaaaaaa" }, snippet: { title: "Rock &amp; Roll l&#39;été", channelTitle: "Napalm &quot;Records&quot;" } },
      { id: { channelId: "UC123" }, snippet: { title: "Une chaîne" } }
    ]
  };
  const expected = [{
    videoId: "aaaaaaaaaaa",
    title: "Rock & Roll l'été",
    channel: "Napalm \"Records\"",
    duration: null,
    thumbnail: "https://i.ytimg.com/vi/aaaaaaaaaaa/mqdefault.jpg"
  }];
  assert.deepEqual(parseDataApiResults(body), expected);
});

test("normalise les résultats Invidious en ne gardant que les vidéos", () => {
  const body = [
    { type: "video", videoId: "bbbbbbbbbbb", title: "Diggy Diggy Hole", author: "Wind Rose", lengthSeconds: 341 },
    { type: "playlist", playlistId: "PL1", title: "Une playlist" },
    { type: "channel", author: "Une chaîne" }
  ];
  const expected = [{
    videoId: "bbbbbbbbbbb",
    title: "Diggy Diggy Hole",
    channel: "Wind Rose",
    duration: 341,
    thumbnail: "https://i.ytimg.com/vi/bbbbbbbbbbb/mqdefault.jpg"
  }];
  assert.deepEqual(parseInvidiousResults(body), expected);
});

test("avec une clé API, la recherche passe par l'API YouTube Data", async () => {
  const calls = [];
  const fetch = async (url) => {
    calls.push(url);
    return fakeResponse({ items: [{ id: { videoId: "ccccccccccc" }, snippet: { title: "Taverne", channelTitle: "Barde" } }] });
  };
  const provider = createSearchProvider({ apiKey: " CLE ", instances: ["https://inv.example"], fetch });

  const results = await provider.search("taverne");

  assert.equal(calls.length, 1);
  const url = new URL(calls[0]);
  assert.equal(url.hostname, "www.googleapis.com");
  assert.equal(url.searchParams.get("q"), "taverne");
  assert.equal(url.searchParams.get("key"), "CLE");
  assert.deepEqual(results.map((result) => result.videoId), ["ccccccccccc"]);
});

test("sans clé API, Invidious passe à l'instance suivante en cas d'échec", async () => {
  const calls = [];
  const fetch = async (url) => {
    calls.push(url);
    if (url.startsWith("https://down.example")) {
      return fakeResponse(null, false);
    }
    return fakeResponse([{ type: "video", videoId: "ddddddddddd", title: "Combat", author: "OST", lengthSeconds: 60 }]);
  };
  const provider = createSearchProvider({ apiKey: "", instances: ["https://down.example", "https://up.example/"], fetch });

  const results = await provider.search("combat épique");

  assert.equal(calls.length, 2);
  const url = new URL(calls[1]);
  assert.equal(url.origin, "https://up.example");
  assert.equal(url.pathname, "/api/v1/search");
  assert.equal(url.searchParams.get("q"), "combat épique");
  assert.deepEqual(results.map((result) => result.videoId), ["ddddddddddd"]);
});

test("sans clé API, échoue si aucune instance Invidious ne répond", async () => {
  const fetch = async () => {
    throw new Error("réseau");
  };
  const provider = createSearchProvider({ apiKey: "", instances: ["https://a.example", "https://b.example"], fetch });

  await assert.rejects(() => provider.search("orage"));
});
