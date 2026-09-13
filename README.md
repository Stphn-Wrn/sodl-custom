# L'Ombre du Seigneur Démon - Module Compagnon

Module Foundry VTT pour la gestion de la réserve de Fortune (points de chance) du groupe et l'aide de jeu pour **L'Ombre du Seigneur Démon**.

**Compatibilité:** Foundry VTT v11+ (testé sur v14 stable 7) | Système `demonlord` v6.1.0+

## Ce qu'il y a dedans

- **Réserve de Fortune partagée** — Une seule réserve pour tout le groupe (pas par personnage). Seul le MJ voit le total et peut le modifier ; les joueurs voient un message masqué.
- **Recherche instantanée** — Une barre de recherche en haut de la fenêtre filtre en direct afflictions, actions, options de mêlée/tir, autres attaques et règles diverses.
- **Aide de jeu complète** — Afflictions, actions, règles de mêlée/tir, règles situationnelles, hors de combat, folie, corruption, incantation de sorts (avec le tableau des utilisations par Puissance/Niveau).
- **Effets de la Fortune** — Effets de base et effets étendus (imposer des fléaux, refuser une Marque des ténèbres, retenir la main de la Mort, etc.), plus une table de fréquence des récompenses visible seulement du MJ.
- **4 onglets** — Ressources, Règles, Actions, Aide.

## Installation

1. Créez un dossier `sodl-companion` dans `Data/modules/`
2. Copiez tous les fichiers du module dedans
3. Activez le module dans les paramètres du monde (il ne s'affiche dans la liste que si le monde tourne sur le système `demonlord`, cf. `module.json`)
4. Relancez votre monde

Une icône livre (SODL) apparaît en bas de la barre d'outils de gauche (les contrôles de scène), pas en bouton flottant.

## Utilisation

Cliquez sur l'icône **SODL** dans la barre d'outils de gauche pour ouvrir l'interface.

**Ressources** — Réserve de Fortune du groupe. Le MJ voit le total, peut faire +1/-1/Réinitialiser et éditer le maximum. Les joueurs voient uniquement un message indiquant que le MJ garde le compte.

**Règles** — Afflictions, règles situationnelles, hors de combat, folie, corruption.

**Actions** — Actions de base, options de mêlée/tir, autres types d'attaques, lancer un sort (avec le tableau des utilisations) et utiliser une incantation.

**Aide** — Infos sur le module et les permissions.

**Recherche** — Tapez dans la barre en haut pour filtrer instantanément tout le contenu ci-dessus par mot-clé, sans changer d'onglet.

## Personnalisation

### Points de chance max par défaut
`scripts/config.js`:
```javascript
resources: {
  chancePoints: {
    maximum: 6
  }
}
```
C'est la valeur par défaut du setting monde `maxChancePoints` ; le MJ peut ensuite l'ajuster directement depuis l'onglet Ressources.

### Contenu des onglets
Toutes les données (afflictions, actions, règles, sorts, effets de Fortune) sont dans `scripts/config.js`. `scripts/sodl-app.js` (`getRulesData()`, `getActionsData()`, `getResourcesData()`) construit l'affichage à partir de ces données.

### Couleurs
`styles/sodl-app.css` — palette sombre inspirée des fiches "Path" du système :
- Accent: `#A13030`
- Fond: `#1b1b1b` / `#171717` / `#202020`
- Texte: `#d8d8d8`

## Structure

```
sodl-companion/
├── module.json
├── scripts/
│   ├── register.js       # Hooks Foundry, settings, bouton scene-controls
│   ├── config.js          # Toutes les données de règles (afflictions, actions, sorts, Fortune...)
│   ├── data-manager.js    # Lecture/écriture de la réserve de Fortune (game.settings)
│   └── sodl-app.js        # FormApplication + logique de recherche
├── styles/sodl-app.css
├── templates/sodl-app.html
└── lang/
    ├── fr.json
    └── en.json
```

## Accéder aux données

La réserve de Fortune est un setting **monde** partagé (pas un flag d'acteur) :

```javascript
// Récupérer la réserve courante / le max
const points = SODLDataManager.getChancePoints();
const max = SODLDataManager.getMaxChancePoints();

// Modifier (MJ seulement, clampé entre 0 et le max)
await SODLDataManager.setChancePoints(5);
await SODLDataManager.modifyChancePoints(+1);

// Changer le maximum (réduit aussi la réserve courante si besoin)
await SODLDataManager.setMaxChancePoints(8);
```

## Problèmes?

**Le module n'apparaît pas dans "Gérer les modules" du monde**
- Vérifiez que le monde tourne bien sur le système `demonlord` (l'ID exact déclaré dans `module.json` → `relationships.systems`), pas juste un système au nom similaire.
- Vérifiez que la version du système installée respecte le minimum déclaré dans `module.json`.

**L'icône SODL n'apparaît pas dans la barre de gauche**
- Actualisez (F5)
- Vérifiez que le module est activé dans le monde
- Ouvrez la console (F12) : une erreur au chargement de `register.js` empêche le hook `getSceneControlButtons` de s'exécuter.

**Le MJ ne voit pas ses changements enregistrés**
- Êtes-vous bien connecté en tant que MJ (pas juste un joueur avec des permissions élevées) ?
- Vérifiez la console (F12) pour les erreurs.

Voir `INSTALLATION.md` et `CUSTOMIZATION.md` pour plus de détails.

## Licence

MIT
