let apiPromise = null;

/**
 * Charge une seule fois l'API IFrame de YouTube et retourne l'objet global `YT`.
 * https://developers.google.com/youtube/iframe_api_reference
 */
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
      reject(new Error("Impossible de charger l'API YouTube."));
    };
    document.head.appendChild(script);
  });
  return apiPromise;
}
