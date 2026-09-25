export const MODULE_ID = "sodl-companion";

// Chemin d'un fichier du module tel que Foundry le sert (templates, sons...).
export function modulePath(relativePath) {
  return `modules/${MODULE_ID}/${relativePath}`;
}
