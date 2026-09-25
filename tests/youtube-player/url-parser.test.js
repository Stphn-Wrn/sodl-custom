import { test } from "node:test";
import assert from "node:assert/strict";
import { parseYoutubeVideoId } from "../../src/features/youtube-player/url-parser.js";

test("extrait l'ID d'une URL watch classique", () => {
  const input = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
  const expected = "dQw4w9WgXcQ";
  assert.equal(parseYoutubeVideoId(input), expected);
});

test("extrait l'ID d'une URL watch avec paramètres supplémentaires", () => {
  const input = "https://www.youtube.com/watch?list=PL123&v=dQw4w9WgXcQ&t=42s";
  const expected = "dQw4w9WgXcQ";
  assert.equal(parseYoutubeVideoId(input), expected);
});

test("extrait l'ID d'une URL courte youtu.be", () => {
  const input = "https://youtu.be/dQw4w9WgXcQ?si=abc";
  const expected = "dQw4w9WgXcQ";
  assert.equal(parseYoutubeVideoId(input), expected);
});

test("extrait l'ID des URLs embed, shorts et live", () => {
  const cases = [
    { input: "https://www.youtube.com/embed/dQw4w9WgXcQ", expected: "dQw4w9WgXcQ" },
    { input: "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ", expected: "dQw4w9WgXcQ" },
    { input: "https://youtube.com/shorts/dQw4w9WgXcQ", expected: "dQw4w9WgXcQ" },
    { input: "https://m.youtube.com/live/dQw4w9WgXcQ?feature=share", expected: "dQw4w9WgXcQ" }
  ];
  for (const { input, expected } of cases) {
    assert.equal(parseYoutubeVideoId(input), expected, input);
  }
});

test("accepte un ID brut, espaces compris", () => {
  const input = "  dQw4w9WgXcQ ";
  const expected = "dQw4w9WgXcQ";
  assert.equal(parseYoutubeVideoId(input), expected);
});

test("retourne null pour une entrée invalide", () => {
  const cases = ["", "pas une url", "https://vimeo.com/123456", "https://www.youtube.com/watch?v=trop-court", null];
  for (const input of cases) {
    assert.equal(parseYoutubeVideoId(input), null, String(input));
  }
});
