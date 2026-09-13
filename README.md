# L'Ombre du Seigneur Démon - Module Compagnon

Module Foundry VTT pour la gestion des points de chance et l'aide de jeu pour **L'Ombre du Seigneur Démon**.

**Compatibilité:** Foundry VTT v11+ (testé sur v14 stable 7) | Système SoDL v6.1.6+

## Ce qu'il y a dedans

- **Gestion des points de chance** — Suivi des points par personnage. Seul le MJ peut modifier.
- **Aide de jeu** — Résumés des afflictions, actions et incantations.
- **4 onglets** — Ressources, Règles, Actions, Aide.

Les joueurs voient tout mais ne peuvent rien modifier. Le MJ a accès complet.

## Installation

1. Créez un dossier `sodl-companion` dans `Data/modules/`
2. Copiez tous les fichiers du module dedans
3. Activez le module dans les paramètres du monde
4. Relancez votre monde

Le bouton SODL apparaît en bas à droite.

## Utilisation

Cliquez sur le bouton **SODL** pour ouvrir l'interface.

**Ressources** — Gestion des points de chance du personnage actif (MJ seulement pour modifier).

**Règles** — Résumé des afflictions et des actions de base.

**Actions** — Descriptions détaillées des actions et incantations.

**Aide** — Infos sur le module et les permissions.

## Personnalisation

### Points de chance max
`scripts/sodl-app.js`, ligne ~60:
```javascript
maxChancePoints: 6
```

### Contenu des onglets
Modifiez `getRulesData()`, `getActionsData()` ou `getHelpData()` dans `scripts/sodl-app.js`.

### Couleurs
`styles/sodl-app.css`:
- Primaire: `#8B0000`
- Accent: `#FFD700`
- Fond: `#1a1a1a`

## Structure

```
sodl-companion/
├── module.json
├── scripts/
│   ├── module.js
│   ├── sodl-app.js
│   └── config.js
├── styles/sodl-app.css
├── templates/sodl-app.html
└── lang/
    ├── fr.json
    └── en.json
```

## Accéder aux données

```javascript
// Récupérer les points
const points = await SODLDataManager.getChancePoints(actor);

// Modifier (MJ seulement)
await SODLDataManager.setChancePoints(5, actor);

// Augmenter/diminuer
await SODLDataManager.modifyChancePoints(+1, actor);
```

## Problèmes?

**Le module n'apparaît pas**
- Vérifiez que le dossier est dans `Data/modules/`
- Vérifiez que `module.json` existe
- Relancez Foundry

**Le bouton n'apparaît pas**
- Actualisez (F5)
- Vérifiez que le module est activé
- Relancez le monde

**Les modifs ne s'enregistrent pas**
- Êtes-vous MJ?
- Avez-vous un personnage sélectionné?
- Vérifiez la console (F12) pour les erreurs

Voir `INSTALLATION.md` et `CUSTOMIZATION.md` pour plus de détails.

## Licence

MIT