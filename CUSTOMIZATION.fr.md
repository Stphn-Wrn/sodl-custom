# Personnalisation

🇬🇧 [English version](CUSTOMIZATION.md)

## Textes et règles

Tous les textes du module sont dans `lang/fr.json` et `lang/en.json`, sous la clé `SODL` :

| Section | Contenu |
|---|---|
| `SODL.Rules` | Aide de jeu : afflictions, actions, options de mêlée/tir, autres attaques, règles situationnelles, hors de combat, folie, corruption, incantation, Fortune |
| `SODL.Companion` | Interface du compagnon |
| `SODL.Hud` | HUD de combat |
| `SODL.Dashboard`, `SODL.Reminders` | Tableau de bord et rappels de round |
| `SODL.DiceClock`, `SODL.Youtube` | Horloge et lecteur YouTube |
| `SODL.Settings` | Noms et descriptions des paramètres |

Pour corriger une règle, modifiez son texte **dans les deux fichiers** : le compagnon, le HUD et les messages du chat en profitent. Les deux fichiers doivent toujours avoir exactement les mêmes clés.

`src/features/companion/config.js` ne contient que la structure de l'aide de jeu (listes, tableaux, maximum de Fortune), avec des clés de traduction à la place des textes. `localizedConfig(t)` renvoie la version traduite.

### Ajouter une affliction

Les afflictions doivent exister dans le système `demonlord` : leur `id` est celui du statut du système (`prone`, `blinded`, `impaired`...).

1. Dans `config.js`, ajoutez `{ id: "monid", name: "SODL.Rules.Afflictions.List.Monid.Name", description: "SODL.Rules.Afflictions.List.Monid.Description" }` à `afflictions.list`.
2. Ajoutez les deux textes dans `lang/fr.json` et `lang/en.json`.

Elle apparaît alors dans le compagnon, la recherche, l'onglet Afflictions du HUD, les rappels de round et le tableau de bord.

### Ajouter une catégorie à la recherche

Dans `buildSearchIndex()` (`src/features/companion/companion-app.js`) :
```javascript
addAll("MaCategorie", config.maNouvelleListe.list);
```
avec une clé `SODL.Companion.Categories.MaCategorie` dans les fichiers de langue. Chaque entrée a un `name` et une `description`.

## Réserve de Fortune

C'est un **paramètre de monde partagé**, pas une valeur par personnage :
- `sodl-companion.chancePoints` : réserve courante ;
- `sodl-companion.maxChancePoints` : maximum, modifiable par le MJ dans le compagnon.

`resources.chancePoints.maximum` dans `config.js` n'est que la valeur de départ du maximum. La réserve n'est visible et modifiable que par le MJ (compagnon et tableau de bord) ; les joueurs annoncent leurs dépenses depuis l'onglet Fortune du HUD.

## HUD de combat

Le code est dans `src/features/combat-hud/` :

| Fichier | Rôle |
|---|---|
| `actor-adapter.js` | Seul fichier qui connaît la structure des acteurs `demonlord` ; produit une vue normalisée (`toSnapshot`) |
| `sections.js` | Les onglets : chacun a un `id`, un `label` (clé de traduction), une `icon` et une méthode `build(snapshot, view, t)` qui renvoie ses tuiles |
| `action-executor.js` | Une fonction par type d'action (`ACTION_STRATEGIES`), qui délègue aux jets du système |
| `equipment-rules.js` | Règles d'équipement strictes (mains, armure, bouclier) |
| `customization.js` | Mode édition : ordre, masquage, favoris |
| `combat-hud.js`, `combat-hud.html`, `combat-hud.css` | Affichage et interactions |

### Ajouter un onglet

1. Dans `sections.js`, créez un objet `{ id, label: "SODL.Hud.Tabs.MonOnglet", icon, build(snapshot, view, t) }` qui renvoie des tuiles (`entry({ id, name, badge, action })`).
2. Ajoutez-le à `SECTIONS_BY_ACTOR_TYPE` (personnages et/ou créatures).
3. Si ses tuiles déclenchent une nouvelle action, ajoutez-la à `ACTION_STRATEGIES` dans `action-executor.js`.
4. Ajoutez la clé du libellé dans les fichiers de langue, et un test dans `tests/combat-hud/sections.test.js`.

Un nouvel onglet apparaît automatiquement en fin de liste chez les joueurs qui ont déjà personnalisé leur HUD.

### Données enregistrées

- `combatHudEnabled` et `combatHudLayout` : liés à chaque utilisateur (v12+) ; `combatHudLayout` contient l'onglet ouvert, le mode, la hauteur, la disposition (`custom`) et les favoris par personnage (`favorites`).
- `flags.sodl-companion.portraitFrame` sur l'acteur : cadrage du portrait, partagé par tous.

### Couleurs

Variables CSS en tête de `combat-hud.css`, sur `.sodl-hud` (`--hud-bg`, `--hud-title`, `--hud-accent`...). Les couleurs des états de santé sont sur `.sodl-hud-state-full`, `-hurt`, `-injured` et `-incapacitated`, et sont réutilisées par le tableau de bord.

## Tableau de bord et rappels de round

- `src/features/party-dashboard/` : `party-row.js` prépare une ligne par personnage joueur (testé), `party-dashboard-app.js` gère la fenêtre. Le masquage des outils MJ du système est dans son `register.js`.
- `src/features/round-reminders/` : `reminders.js` construit les rappels (testé), `register.js` les envoie au MJ à chaque nouveau round.

## Horloge à Dés

Les réglages courants se font dans les paramètres du module. Le reste est dans `src/features/dice-clock/` :
- **boutons du MJ** : `dice-clock.html` pour l'affichage, `activateListeners()` de `dice-clock-app.js` pour l'action ;
- **messages du chat** : `_removeOnePoint()` et `resetClock()` de `dice-clock-manager.js`, textes dans `SODL.DiceClock.Chat` ;
- **son par défaut** : `sounds/vecna-clock.mp3` ;
- **apparence** : `dice-clock.css`.

## Lecteur YouTube

Le code est dans `src/features/youtube-player/`.

- **Couleurs** : variables CSS en tête de `youtube-player.css`, sur `.yt-widget`.
- **Position et taille par défaut** : `_loadLayout()` de `widget.js`.
- **Synchronisation** : `SYNC_TOLERANCE` (`broadcast.js`, 2 s) est l'écart au-delà duquel un joueur est recalé ; `SYNC_INTERVAL_MS` (`widget.js`, 1 s) la fréquence de vérification.
- **Recherche** : `search.js` définit un fournisseur par service (API YouTube Data si une clé est renseignée, sinon Invidious). Pour ajouter un service, écrivez un fournisseur exposant `search(text)` et branchez-le dans `createSearchProvider`. `SEARCH_RESULTS_LIMIT` règle le nombre de résultats.
- **Formats de liens** : ajoutez une fonction à `PARSING_STRATEGIES` dans `url-parser.js`.
- **Données** : `youtubeLibrary` et `youtubeBroadcast` (monde), `youtubeVolume` et `youtubeWidgetLayout` (chaque utilisateur).

## Ajouter un outil

Chaque outil est un dossier de `src/features/` dont le `register.js` exporte les étapes dont il a besoin :

```javascript
import { MODULE_ID } from "../../shared/constants.js";
import { t } from "../../shared/foundry-adapter.js";

export const monOutilFeature = {
  init() {
    game.settings.register(MODULE_ID, "monOutilEnabled", {
      name: "SODL.Settings.MonOutilEnabled.Name",
      hint: "SODL.Settings.MonOutilEnabled.Hint",
      scope: "world",
      config: true,
      type: Boolean,
      default: true
    });
  },
  ready() {},
  getSceneControlButtons(controls) {}
};
```

Ajoutez-le ensuite à `FEATURES` dans `src/main.js`, et sa feuille de style à `styles` dans `module.json`.

Conventions :
- gabarits référencés avec `modulePath(...)` (`src/shared/constants.js`) ;
- API de Foundry qui changent selon la version : passer par `src/shared/foundry-adapter.js` ;
- logique pure (sans `game` ni `ui`) dans des fichiers à part, testés avec `npm test` ;
- aucun texte en dur : tout passe par les fichiers de langue.

## Traduction

- Dans un gabarit : `{{localize "SODL.Ma.Cle"}}`, ou avec des variables `{{localize "SODL.Ma.Cle" nom=valeur}}`.
- Dans le code Foundry : `t("SODL.Ma.Cle", { nom: valeur })` depuis `src/shared/foundry-adapter.js`.
- Dans le code pur : recevez `t` en paramètre, et levez une `LocalizedError(cle, donnees)` (`src/shared/i18n.js`) plutôt qu'un texte.
- Noms et descriptions des paramètres : mettez directement la clé, Foundry la traduit à l'affichage.

Les tests utilisent `lang/fr.json` (`tests/helpers/i18n.js`) : leurs attentes sont en français.

## Tester

```bash
npm test
```

Les tests de la logique pure sont dans `tests/`, rangés par outil comme `src/features/`. Ils tournent aussi sur GitHub à chaque push, et avant chaque release.

Dans Foundry, testez avec un compte MJ et un compte joueur (par exemple dans deux navigateurs) : réserve de Fortune masquée côté joueur, horloge en lecture seule, diffusion YouTube répercutée, HUD et favoris propres à chaque joueur. Après une modification du JavaScript, rechargez avec Ctrl+Maj+R : les modules sont mis en cache par le navigateur.
