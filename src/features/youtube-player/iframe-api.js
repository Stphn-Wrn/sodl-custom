import { LocalizedError } from "../../shared/i18n.js";

let apiPromise = null;

export function loadYoutubeIframeApi() {
  if (apiPromise) {
    return apiPromise;
  }
  apiPromise = new Promise((resolve, reject) => {
    if (window.YT?.Player) {
      resolve(window.YT);
      return;
    }
    const previousCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (typeof previousCallback === "function") {
        previousCallback();
      }
      resolve(window.YT);
    };
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    script.onerror = () => {
      apiPromise = null;
      reject(new LocalizedError("SODL.Youtube.Errors.IframeApi"));
    };
    document.head.appendChild(script);
  });
  return apiPromise;
}
