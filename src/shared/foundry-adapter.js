// Globales en v11, espaces de noms `foundry.*` à partir de v12/v13.

export function getDialogClass() {
  return foundry?.appv1?.api?.Dialog ?? globalThis.Dialog;
}

export function renderTemplate(path, data) {
  const render = foundry?.applications?.handlebars?.renderTemplate ?? globalThis.renderTemplate;
  return render(path, data);
}

export function loadTemplates(paths) {
  const load = foundry?.applications?.handlebars?.loadTemplates ?? globalThis.loadTemplates;
  return load(paths);
}

export function playSound(options) {
  const AudioHelperClass = foundry?.audio?.AudioHelper ?? globalThis.AudioHelper;
  return AudioHelperClass.play(options, true);
}

export function escapeHTML(value) {
  return Handlebars.escapeExpression(value ?? "");
}

export function rerenderOpenApps(AppClass) {
  for (const app of Object.values(ui.windows)) {
    if (app instanceof AppClass) {
      app.render(false);
    }
  }
}

export function t(key, data) {
  if (data) {
    return game.i18n.format(key, data);
  }
  return game.i18n.localize(key);
}

export function errorMessage(err) {
  return t(err.message, err.data);
}
