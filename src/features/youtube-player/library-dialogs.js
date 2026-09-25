import { getDialogClass, escapeHTML } from "../../shared/foundry-adapter.js";
import { SODLYoutubeManager } from "./library-manager.js";
import { UNSORTED_FOLDER_NAME } from "./library.js";

/**
 * Boîtes de dialogue d'édition de la bibliothèque (réservées au MJ).
 */

export function promptFolderName(title, currentName, onSubmit) {
  const Dialog = getDialogClass();
  new Dialog({
    title,
    content: `
      <form class="yt-dialog-form">
        <div class="form-group">
          <label>Nom</label>
          <input type="text" name="name" value="${escapeHTML(currentName)}" autofocus>
        </div>
      </form>
    `,
    buttons: {
      ok: {
        icon: '<i class="fas fa-check"></i>',
        label: "Valider",
        callback: (html) => onSubmit(html.find('[name="name"]').val())
      },
      cancel: {
        icon: '<i class="fas fa-times"></i>',
        label: "Annuler"
      }
    },
    default: "ok"
  }).render(true);
}

// Sans vidéo : formulaire d'ajout. Avec une vidéo : modification du titre et du dossier.
export function promptVideo(video = null) {
  const Dialog = getDialogClass();
  const folders = SODLYoutubeManager.getLibrary().folders;
  const selectedFolderId = video?.folderId ?? null;

  let folderOptions = `<option value="">${UNSORTED_FOLDER_NAME}</option>`;
  for (const folder of folders) {
    let selected = "";
    if (folder.id === selectedFolderId) {
      selected = "selected";
    }
    folderOptions += `<option value="${escapeHTML(folder.id)}" ${selected}>${escapeHTML(folder.name)}</option>`;
  }

  let urlField = `
    <div class="form-group">
      <label>Lien YouTube</label>
      <input type="text" name="url" placeholder="https://www.youtube.com/watch?v=..." autofocus>
    </div>
  `;
  let titlePlaceholder = "Laisser vide pour utiliser le titre YouTube";
  let dialogTitle = "Ajouter une vidéo";
  if (video) {
    urlField = "";
    titlePlaceholder = "";
    dialogTitle = "Modifier la vidéo";
  }

  new Dialog({
    title: dialogTitle,
    content: `
      <form class="yt-dialog-form">
        ${urlField}
        <div class="form-group">
          <label>Titre</label>
          <input type="text" name="title" value="${escapeHTML(video?.title)}" placeholder="${titlePlaceholder}">
        </div>
        <div class="form-group">
          <label>Dossier</label>
          <select name="folderId">${folderOptions}</select>
        </div>
      </form>
    `,
    buttons: {
      ok: {
        icon: '<i class="fas fa-check"></i>',
        label: "Valider",
        callback: (html) => submitVideo(video, {
          url: html.find('[name="url"]').val(),
          title: html.find('[name="title"]').val(),
          folderId: html.find('[name="folderId"]').val() || null
        })
      },
      cancel: {
        icon: '<i class="fas fa-times"></i>',
        label: "Annuler"
      }
    },
    default: "ok"
  }).render(true);
}

async function submitVideo(video, { url, title, folderId }) {
  if (!video) {
    await SODLYoutubeManager.addVideo({ url, title, folderId });
    return;
  }
  const renamed = await SODLYoutubeManager.renameVideo(video.id, title);
  if (renamed) {
    await SODLYoutubeManager.moveVideo(video.id, folderId);
  }
}

export function confirmRemoval(title, content, onConfirm) {
  const Dialog = getDialogClass();
  new Dialog({
    title,
    content,
    buttons: {
      yes: {
        icon: '<i class="fas fa-trash"></i>',
        label: "Supprimer",
        callback: onConfirm
      },
      no: {
        icon: '<i class="fas fa-times"></i>',
        label: "Annuler"
      }
    },
    default: "no"
  }).render(true);
}
