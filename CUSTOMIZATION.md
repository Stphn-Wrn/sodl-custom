# Personnalisation

## Modifier le contenu des onglets

Toutes les données de règles vivent dans `src/features/companion/config.js` : `afflictions`, `actions`, `meleeOptions`, `rangedOptions`, `otherAttacks`, `situationalRules`, `outOfCombat`, `madness`, `corruption`, `spellcasting`, `chancePointsRules`, `fortuneAwardsTable`.

Exemple, ajouter une affliction :
```javascript
afflictions: {
  list: [
    // ...
    { id: "mycustom", name: "Mon Affliction", description: "Description ici." }
  ]
}
```

`src/features/companion/companion-app.js` transforme ces données en HTML pour les onglets Règles/Actions (`getRulesData()`, `getActionsData()`) et alimente aussi l'index de recherche (`buildSearchIndex()`) — toute entrée `{ name, description }` ajoutée dans une des listes ci-dessus devient automatiquement cherchable si elle est incluse dans un `addAll(...)` de `buildSearchIndex()`.

**Onglet Aide** — Contenu en dur dans `getHelpData()` (`src/features/companion/companion-app.js`), pas dans `config.js`.

## Ajouter une catégorie à la recherche

Dans `buildSearchIndex()` (`src/features/companion/companion-app.js`) :
```javascript
addAll("MaCatégorie", SODL_CONFIG.maNouvelleListe.list);
```
Chaque entrée doit avoir `name` et `description`.

## Changer les couleurs (Compagnon)

`src/features/companion/companion.css` — variables de couleur principales utilisées un peu partout :

```css
/* Accent (bordures actives, hover, icônes) */
#A13030

/* Fonds */
#1b1b1b   /* fond principal */
#171717   /* en-têtes, barre de recherche, scrollbar track */
#202020   /* cartes (resource-card) */

/* Texte */
#d8d8d8   /* texte principal */
#a5a5a5 / #999 / #777   /* texte secondaire, dégradé de gris */
```

Le fond parchemin par défaut de Foundry est explicitement écrasé sur `#sodl-companion-app .window-content` — ne pas le retirer sous peine de voir réapparaître la texture parchemin derrière l'interface.

## Réserve de Fortune (points de chance)

C'est un **setting monde partagé**, pas un flag par acteur. Deux settings sont enregistrés dans `src/features/companion/register.js` :
- `sodl-companion.chancePoints` — réserve courante
- `sodl-companion.maxChancePoints` — maximum (défaut: `SODL_CONFIG.resources.chancePoints.maximum`, éditable par le MJ dans l'onglet Ressources)

### Changer le maximum par défaut
`src/features/companion/config.js`:
```javascript
resources: {
  chancePoints: {
    maximum: 6
  }
}
```
Cette valeur ne sert que de valeur initiale du setting `maxChancePoints` — une fois modifiée depuis l'interface, c'est le setting qui fait foi.

### Masquer/afficher la réserve aux joueurs
Contrôlé dans `src/features/companion/companion.html` par `{{#if canEdit}}` (= `game.user.isGM`). Pour la rendre visible aux joueurs, remplacer la condition `canEdit` par une condition toujours vraie autour du bloc `.chance-display`.

## Ajouter une nouvelle ressource partagée

Exemple : ajouter des points de mana partagés, sur le même modèle que la Fortune.

1. Enregistrer un setting dans `init()` de `src/features/companion/register.js` :
```javascript
game.settings.register(MODULE_ID, "manaPoints", {
  scope: "world",
  config: false,
  type: Number,
  default: 0,
  onChange: () => rerenderOpenApps(SODLCompanionApp)
});
```

2. Ajouter les méthodes dans `SODLDataManager` (`src/features/companion/data-manager.js`), sur le modèle de `getChancePoints`/`setChancePoints`/`modifyChancePoints`.

3. Exposer les données dans `getResourcesData()` (`src/features/companion/companion-app.js`) et les afficher dans `src/features/companion/companion.html`.

## Horloge à Dés

Tous les réglages courants se font sans toucher au code, dans *Paramètres → Configurer les paramètres* : nombre de dés, faces par dé, minutes par point, heure de départ, son du carillon (laisser vide pour le couper) et message final.

Le reste se trouve dans `src/features/dice-clock/` :
- **Boutons du MJ** (libellés, nombre de points retirés) — `dice-clock.html` pour l'affichage, `activateListeners()` de `dice-clock-app.js` pour l'action. Par exemple `removePoints(SODLDiceClockManager.pipsPerHour)` retire une heure.
- **Messages du chat** (heure pleine, remise à zéro) — `_removeOnePoint()` et `resetClock()` dans `dice-clock-manager.js`.
- **Son par défaut** — `sounds/vecna-clock.mp3`, référencé dans `register.js` (setting `diceClockSoundPath`).
- **Apparence** — `dice-clock.css`.

## Lecteur YouTube

Le code vit dans `src/features/youtube-player/`.

### Couleurs du widget
Définies en variables CSS en tête de `youtube-player.css`, sur `.yt-widget` :

```css
--ytw-bg: rgba(20, 20, 23, 0.9);  /* fond translucide */
--ytw-accent: #c9544f;            /* point « en direct », vidéo active */
--ytw-title: #e0c9a6;             /* titres, noms de dossiers */
--ytw-text: #dcdcdc;
--ytw-muted: #8b8b90;
```

### Position et taille par défaut
Dans `_loadLayout()` (`widget.js`) : `top`, `width` et `libraryOpen`. Au premier affichage, le widget se place à gauche de la barre latérale (`left` calculé dans `_applyLayout()`). Chaque utilisateur retrouve ensuite la position qu'il a choisie : elle est stockée dans le setting client `youtubeWidgetLayout`.

### Précision de la synchronisation
- `SYNC_TOLERANCE` (`broadcast.js`, 2 s par défaut) : écart au-delà duquel le lecteur d'un joueur est recalé sur celui du MJ. Plus bas, les recalages sont plus fréquents (et plus visibles).
- `SYNC_INTERVAL_MS` (`widget.js`, 1 s) : fréquence de vérification.

### Formats de liens acceptés
`url-parser.js` essaie une liste de stratégies (ID seul, `youtu.be`, `watch?v=`, `/embed`, `/shorts`, `/live`). Pour accepter un nouveau format, ajoutez une fonction à `PARSING_STRATEGIES` qui renvoie l'ID trouvé ou `null`, et un cas dans `tests/youtube-player/url-parser.test.js`.

### Données
- `youtubeLibrary` (monde) : `{ folders: [{ id, name }], videos: [{ id, title, videoId, folderId }] }` — `folderId: null` signifie « Non classé ».
- `youtubeBroadcast` (monde) : `{ video, playing, position, updatedAt }` — chaque client calcule la position attendue à partir de `position` et de `updatedAt` (heure du serveur).
- `youtubeVolume` et `youtubeWidgetLayout` (client) : préférences de chaque utilisateur.

## Ajouter un nouvel outil

Chaque outil est un dossier de `src/features/` qui exporte, depuis son `register.js`, un objet avec les étapes dont il a besoin :

```javascript
// src/features/mon-outil/register.js
import { MODULE_ID } from "../../shared/constants.js";

export const monOutilFeature = {
  init() {
    // settings, globales window.*, loadTemplates(...)
    game.settings.register(MODULE_ID, "monOutilEnabled", { /* ... */ });
  },
  ready() {
    // actions une fois la partie chargée (optionnel)
  },
  getSceneControlButtons(controls) {
    // bouton dans la barre de gauche (optionnel)
  }
};
```

Puis l'ajouter à la liste `FEATURES` de `src/main.js`, et déclarer sa feuille de style dans `module.json` (`styles`).

Conventions :
- Templates référencés avec `modulePath("src/features/mon-outil/mon-outil.html")` (`src/shared/constants.js`).
- API de Foundry qui changent selon la version (`Dialog`, `renderTemplate`, `loadTemplates`, `AudioHelper`) : passer par `src/shared/foundry-adapter.js` plutôt que par les globales.
- Logique métier pure (sans `game` ni `ui`) dans des fichiers à part, pour pouvoir la tester avec `npm test`.

## Traductions

Fichiers: `lang/fr.json` et `lang/en.json`

Ajouter une clé:
```json
{
  "SODL": {
    "MyKey": "Ma traduction"
  }
}
```

Utiliser dans le template: `{{localize 'SODL.MyKey'}}`

Notez que la majorité du contenu (règles, afflictions, effets de Fortune...) est actuellement en dur en français dans `config.js`, pas dans les fichiers de langue.

## Relancer après les modifs

Fermez et rouvrez le monde (ou relancez Foundry) après avoir modifié les fichiers JavaScript — les modules ES sont mis en cache par le navigateur, un simple F5 peut ne pas suffire (Ctrl+Shift+R au besoin).

## Tester

**Tests automatiques** — La logique pure (liens YouTube, bibliothèque, synchronisation) est testée avec le lanceur intégré de Node (v22+), sans dépendance à installer :

```bash
npm test
```

Les tests sont dans `tests/`, rangés par outil comme `src/features/`.

**Dans Foundry** — Ouvrez la console (F12) pour voir les erreurs. Testez avec un compte MJ et un compte joueur (par exemple dans deux navigateurs différents) pour vérifier :
- que la réserve de Fortune reste bien masquée côté joueur ;
- que l'horloge est en lecture seule côté joueur ;
- que la diffusion YouTube (lancement, pause, saut, arrêt) est bien répercutée chez le joueur.
