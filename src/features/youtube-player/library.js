/**
 * Logique pure de la bibliothèque de vidéos YouTube (aucune dépendance à Foundry).
 * Chaque opération retourne une nouvelle bibliothèque sans modifier l'originale.
 *
 * Forme : { folders: [{ id, name }], videos: [{ id, title, videoId, folderId }] }
 * Une vidéo dont le folderId vaut null est « Non classée ».
 */

export const UNSORTED_FOLDER_NAME = "Non classé";

export function createEmptyLibrary() {
  return { folders: [], videos: [] };
}

function requireText(value, label) {
  const text = String(value ?? "").trim();
  if (!text) {
    throw new Error(`${label} ne peut pas être vide.`);
  }
  return text;
}

function resolveFolderId(library, folderId) {
  if (library.folders.some((folder) => folder.id === folderId)) {
    return folderId;
  }
  return null;
}

function updateVideo(library, videoId, changes) {
  return {
    ...library,
    videos: library.videos.map((video) => {
      if (video.id !== videoId) {
        return video;
      }
      return { ...video, ...changes };
    })
  };
}

function byLabel(getLabel) {
  return (a, b) => getLabel(a).localeCompare(getLabel(b), "fr", { sensitivity: "base" });
}

export function addFolder(library, name, id) {
  const folder = { id, name: requireText(name, "Le nom du dossier") };
  return { ...library, folders: [...library.folders, folder] };
}

export function renameFolder(library, folderId, name) {
  const newName = requireText(name, "Le nom du dossier");
  return {
    ...library,
    folders: library.folders.map((folder) => {
      if (folder.id !== folderId) {
        return folder;
      }
      return { ...folder, name: newName };
    })
  };
}

// Les vidéos du dossier supprimé ne sont pas perdues : elles passent dans « Non classé ».
export function removeFolder(library, folderId) {
  return {
    folders: library.folders.filter((folder) => folder.id !== folderId),
    videos: library.videos.map((video) => {
      if (video.folderId !== folderId) {
        return video;
      }
      return { ...video, folderId: null };
    })
  };
}

export function addVideo(library, { title, videoId, folderId }, id) {
  const video = {
    id,
    title: requireText(title, "Le titre de la vidéo"),
    videoId: requireText(videoId, "L'identifiant YouTube"),
    folderId: resolveFolderId(library, folderId)
  };
  return { ...library, videos: [...library.videos, video] };
}

export function renameVideo(library, videoId, title) {
  return updateVideo(library, videoId, { title: requireText(title, "Le titre de la vidéo") });
}

export function moveVideo(library, videoId, folderId) {
  return updateVideo(library, videoId, { folderId: resolveFolderId(library, folderId) });
}

export function removeVideo(library, videoId) {
  return { ...library, videos: library.videos.filter((video) => video.id !== videoId) };
}

/**
 * Regroupe les vidéos par dossier pour l'affichage : dossiers triés par nom,
 * vidéos triées par titre, et groupe « Non classé » en dernier s'il n'est pas vide.
 */
export function buildLibraryView(library) {
  const sortedVideos = [...library.videos].sort(byLabel((video) => video.title));
  const videosIn = (folderId) => sortedVideos.filter((video) => video.folderId === folderId);

  const groups = [...library.folders]
    .sort(byLabel((folder) => folder.name))
    .map((folder) => ({ id: folder.id, name: folder.name, videos: videosIn(folder.id) }));

  const unsorted = videosIn(null);
  if (unsorted.length > 0) {
    groups.push({ id: null, name: UNSORTED_FOLDER_NAME, videos: unsorted });
  }
  return groups;
}
