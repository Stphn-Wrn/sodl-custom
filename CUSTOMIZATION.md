# Personnalisation

## Modifier le contenu des onglets

Toutes les données de règles vivent dans `scripts/config.js` : `afflictions`, `actions`, `meleeOptions`, `rangedOptions`, `otherAttacks`, `situationalRules`, `outOfCombat`, `madness`, `corruption`, `spellcasting`, `chancePointsRules`, `fortuneAwardsTable`.

Exemple, ajouter une affliction :
```javascript
afflictions: {
  list: [
    // ...
    { id: "mycustom", name: "Mon Affliction", description: "Description ici." }
  ]
}
```

`scripts/sodl-app.js` transforme ces données en HTML pour les onglets Règles/Actions (`getRulesData()`, `getActionsData()`) et alimente aussi l'index de recherche (`buildSearchIndex()`) — toute entrée `{ name, description }` ajoutée dans une des listes ci-dessus devient automatiquement cherchable si elle est incluse dans un `addAll(...)` de `buildSearchIndex()`.

**Onglet Aide** — Contenu en dur dans `getHelpData()` (`scripts/sodl-app.js`), pas dans `config.js`.

## Ajouter une catégorie à la recherche

Dans `buildSearchIndex()` (`scripts/sodl-app.js`) :
```javascript
addAll("MaCatégorie", SODL_CONFIG.maNouvelleListe.list);
```
Chaque entrée doit avoir `name` et `description`.

## Changer les couleurs

`styles/sodl-app.css` — variables de couleur principales utilisées un peu partout :

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

C'est un **setting monde partagé**, pas un flag par acteur. Deux settings sont enregistrés dans `scripts/register.js` :
- `sodl-companion.chancePoints` — réserve courante
- `sodl-companion.maxChancePoints` — maximum (défaut: `SODL_CONFIG.resources.chancePoints.maximum`, éditable par le MJ dans l'onglet Ressources)

### Changer le maximum par défaut
`scripts/config.js`:
```javascript
resources: {
  chancePoints: {
    maximum: 6
  }
}
```
Cette valeur ne sert que de valeur initiale du setting `maxChancePoints` — une fois modifiée depuis l'interface, c'est le setting qui fait foi.

### Masquer/afficher la réserve aux joueurs
Contrôlé dans `templates/sodl-app.html` par `{{#if canEdit}}` (= `game.user.isGM`). Pour la rendre visible aux joueurs, remplacer la condition `canEdit` par une condition toujours vraie autour du bloc `.chance-display`.

## Ajouter une nouvelle ressource partagée

Exemple : ajouter des points de mana partagés, sur le même modèle que la Fortune.

1. Enregistrer un setting dans `scripts/register.js` :
```javascript
game.settings.register("sodl-companion", "manaPoints", {
  scope: "world",
  config: false,
  type: Number,
  default: 0,
  onChange: rerenderOpenApps
});
```

2. Ajouter les méthodes dans `SODLDataManager` (`scripts/data-manager.js`), sur le modèle de `getChancePoints`/`setChancePoints`/`modifyChancePoints`.

3. Exposer les données dans `getResourcesData()` (`scripts/sodl-app.js`) et les afficher dans `templates/sodl-app.html`.

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

Ouvrez la console (F12) pour voir les erreurs. Testez avec un compte MJ et un compte joueur pour vérifier que la réserve de Fortune reste bien masquée côté joueur.
