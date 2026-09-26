import { LocalizedError } from "../../shared/i18n.js";

export const UNSORTED_FOLDER_NAME = "SODL.Youtube.Unsorted";

export function createEmptyLibrary() {
  return { folders: [], videos: [] };
}

function requireText(value, errorKey) {
  const text = String(value ?? "").trim();
  if (!text) {
    throw new LocalizedError(errorKey);
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
  const folder = { id, name: requireText(name, "SODL.Youtube.Errors.EmptyFolderName") };
  return { ...library, folders: [...library.folders, folder] };
}

export function renameFolder(library, folderId, name) {
  const newName = requireText(name, "SODL.Youtube.Errors.EmptyFolderName");
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
    title: requireText(title, "SODL.Youtube.Errors.EmptyVideoTitle"),
    videoId: requireText(videoId, "SODL.Youtube.Errors.EmptyVideoId"),
    folderId: resolveFolderId(library, folderId)
  };
  return { ...library, videos: [...library.videos, video] };
}

export function renameVideo(library, videoId, title) {
  return updateVideo(library, videoId, { title: requireText(title, "SODL.Youtube.Errors.EmptyVideoTitle") });
}

export function moveVideo(library, videoId, folderId) {
  return updateVideo(library, videoId, { folderId: resolveFolderId(library, folderId) });
}

export function removeVideo(library, videoId) {
  return { ...library, videos: library.videos.filter((video) => video.id !== videoId) };
}

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
