# Installation

## Avant de commencer

Vous avez besoin de:
- Foundry VTT (v11 minimum, testé sur v14 stable 7)
- Le système de jeu `demonlord` ("Shadow of the Demon Lord") installé
- Accès MJ pour activer le module

## Installation

### Option A — Par URL de manifeste (recommandé)

1. Dans l'écran d'accueil de Foundry, onglet **Add-on Modules**, cliquez sur **Install Module**
2. Collez l'URL suivante dans le champ **Manifest URL** en bas de la fenêtre :
   ```
   https://raw.githubusercontent.com/Stphn-Wrn/sodl-custom/main/module.json
   ```
3. Cliquez sur **Install**, puis passez à **Activer dans Foundry** ci-dessous.

Avec cette méthode, Foundry propose automatiquement les mises à jour.

### Option B — Installation manuelle

#### Copier les fichiers

Localisez votre dossier `Data`:
- **Windows**: `C:\Users\[VotreNom]\AppData\Local\FoundryVTT\Data`
- **macOS**: `~/Library/Application Support/FoundryVTT/Data`
- **Linux**: `~/.foundryvtt/Data`

Créez un dossier `sodl-companion` dans `Data/modules/` et copiez tous les fichiers du module dedans (`module.json` doit être à la racine de ce dossier).

### Activer dans Foundry

1. Ouvrez Foundry VTT et lancez un monde utilisant le système `demonlord`
2. Allez dans **World Settings** → **Modules**
3. Trouvez **"L'Ombre du Seigneur Démon - Companion"**
4. Cochez la case pour l'activer
5. Cliquez sur **Save Module Settings**

> Le module ne s'affiche dans cette liste que si le monde tourne sur le système `demonlord` avec une version compatible (voir `module.json` → `relationships.systems`). S'il est absent de la liste, vérifiez d'abord le système du monde avant de suspecter un problème d'installation.

### Relancer

Fermez et rouvrez votre monde. Dans la barre d'outils de gauche (les contrôles de scène) apparaissent :
- une icône **livre (SODL)** — le Compagnon (règles, recherche, réserve de Fortune) ;
- une icône **dé** — l'Horloge à Dés.

### Choisir les outils (optionnel)

Dans **Paramètres → Configurer les paramètres → L'Ombre du Seigneur Démon - Companion** :
- **Horloge à Dés : activer le module** — activé par défaut ; décochez pour masquer l'horloge. Ses autres réglages (dés, faces, heure de départ, son...) sont au même endroit.
- **Lecteur YouTube : activer le module** — désactivé par défaut ; cochez pour afficher le widget de diffusion vidéo.
- **Lecteur YouTube : clé API (recherche)** — facultatif ; une clé YouTube Data API v3 rend la recherche intégrée fiable (sinon, instances Invidious publiques).

Ces deux options demandent de rafraîchir la partie pour s'appliquer.

## Troubleshooting

**Le module n'apparaît pas dans "Gérer les modules"?**
- Le dossier est dans `Data/modules/` et contient `module.json` à sa racine ?
- Le monde utilise bien le système `demonlord` ? (l'ID compte, pas le nom affiché)
- La version du système installée respecte-t-elle le minimum demandé par le module ?

**Le module apparaît mais l'icône SODL n'apparaît pas dans la barre de gauche?**
- Actualisez (F5), au besoin avec Ctrl+Shift+R pour vider le cache des scripts
- Vérifiez que le module est bien activé et sauvegardé pour ce monde
- Ouvrez la console (F12) pour repérer une erreur JavaScript au chargement

**Le widget YouTube n'apparaît pas?**
- Vérifiez que l'option **Lecteur YouTube : activer le module** est cochée, puis rafraîchissez la partie
- Côté joueur, c'est normal hors diffusion : le widget n'apparaît que quand le MJ lance une vidéo
- L'API YouTube est chargée depuis `youtube.com` : le lecteur ne fonctionne pas hors ligne ou si YouTube est bloqué sur le réseau

**Le MJ ne peut pas modifier la réserve de Fortune?**
- Êtes-vous connecté avec un compte ayant le rôle **Gamemaster** (pas juste des permissions élevées) ?
- Vérifiez la console (F12) pour les erreurs

## Mise à jour

**Installé par URL de manifeste** — Dans l'onglet **Add-on Modules**, cliquez sur **Update** à côté du module (ou **Check for Updates**).

**Installé manuellement :**
1. Supprimez `Data/modules/sodl-companion/`
2. Copiez la nouvelle version
3. Relancez Foundry (ou Ctrl+Shift+R dans le monde pour forcer le rechargement des scripts)

Les données (réserve de Fortune, état de l'horloge, bibliothèque YouTube) sont stockées dans le monde, pas dans le dossier du module : elles sont conservées lors d'une mise à jour.

## Désinstaller

1. **World Settings** → **Modules**
2. Décochez SODL Companion
3. **Save Module Settings**
4. Supprimez le dossier `sodl-companion`
5. Relancez
