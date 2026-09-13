# Personnalisation

## Modifier le contenu des onglets

Éditer `scripts/sodl-app.js`.

**Onglet Règles** — Trouvez `getRulesData()`:
```javascript
async getRulesData() {
  return {
    sections: [
      {
        title: "Mes Afflictions",
        content: `<ul><li>Mon contenu ici</li></ul>`
      }
    ]
  };
}
```

**Onglet Actions** — Trouvez `getActionsData()` et faites pareil.

**Onglet Aide** — Trouvez `getHelpData()`.

## Changer les couleurs

`styles/sodl-app.css`:

```css
/* Couleur primaire */
background: #8B0000;

/* Accent */
color: #FFD700;

/* Fond */
background: #1a1a1a;
```

## Points de chance max

`scripts/sodl-app.js`, ligne ~60:
```javascript
maxChancePoints: 6
```

## Permissions

`scripts/config.js`:
```javascript
permissions: {
  players: {
    canRead: true,
    canEdit: false
  },
  gm: {
    canRead: true,
    canEdit: true
  }
}
```

## Ajouter une nouvelle ressource

Exemple: ajouter des points de mana.

1. Dans `scripts/sodl-app.js`, modifier `getResourcesData()`:
```javascript
const manaPoints = actor ? 
  await SODLDataManager.getManaPoints(actor) : 0;

return {
  // ...
  manaPoints: manaPoints,
  maxManaPoints: 10
};
```

2. Ajouter les méthodes dans `SODLDataManager`:
```javascript
static async getManaPoints(actor = null) {
  if (!actor) actor = game.user.character;
  return actor?.getFlag("sodl-companion", "manaPoints") || 0;
}

static async setManaPoints(value, actor = null) {
  if (!actor) actor = game.user.character;
  if (!actor || !game.user.isGM) return false;
  await actor.setFlag("sodl-companion", "manaPoints", Math.max(0, value));
  return true;
}
```

3. Ajouter dans le template `templates/sodl-app.html`:
```html
<div class="resource-card">
  <h3>Points de Mana</h3>
  <div class="chance-display">
    <div class="chance-value">{{tabs.resources.manaPoints}}</div>
    <div class="chance-max">/ {{tabs.resources.maxManaPoints}}</div>
  </div>
</div>
```

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

## Thème clair

Dans `styles/sodl-app.css`:
```css
#sodl-companion-app {
  background: linear-gradient(to bottom, #f0f0f0, #e0e0e0);
  color: #333;
  border: 2px solid #4a90e2;
}

#sodl-companion-app .window-header {
  background: linear-gradient(90deg, #4a90e2, #2e5c8a);
}
```

## Mobile

Ajouter à `styles/sodl-app.css`:
```css
@media (max-width: 600px) {
  #sodl-companion-app {
    width: 100% !important;
    height: 100% !important;
  }
  
  .chance-points-section {
    grid-template-columns: 1fr;
  }
}
```

## Relancer après les modifs

Fermez et rouvrez le monde (ou relancez Foundry) après avoir modifié les fichiers JavaScript.

## Tester

Ouvrez la console (F12) pour voir les erreurs. Testez avec un MJ et un joueur pour vérifier les permissions.
