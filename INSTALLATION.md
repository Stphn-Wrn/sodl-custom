# Installation

## Avant de commencer

Vous avez besoin de:
- Foundry VTT (v11 minimum, testé sur v14 stable 7)
- Le système de jeu `demonlord` ("Shadow of the Demon Lord") installé
- Accès MJ pour activer le module

## Installation

### 1. Copier les fichiers

Localisez votre dossier `Data`:
- **Windows**: `C:\Users\[VotreNom]\AppData\Local\FoundryVTT\Data`
- **macOS**: `~/Library/Application Support/FoundryVTT/Data`
- **Linux**: `~/.foundryvtt/Data`

Créez un dossier `sodl-companion` dans `Data/modules/` et copiez tous les fichiers du module dedans (`module.json` doit être à la racine de ce dossier).

### 2. Activer dans Foundry

1. Ouvrez Foundry VTT et lancez un monde utilisant le système `demonlord`
2. Allez dans **World Settings** → **Modules**
3. Trouvez **"L'Ombre du Seigneur Démon - Companion"**
4. Cochez la case pour l'activer
5. Cliquez sur **Save Module Settings**

> Le module ne s'affiche dans cette liste que si le monde tourne sur le système `demonlord` avec une version compatible (voir `module.json` → `relationships.systems`). S'il est absent de la liste, vérifiez d'abord le système du monde avant de suspecter un problème d'installation.

### 3. Relancer

Fermez et rouvrez votre monde. Une icône livre (SODL) apparaît en bas de la barre d'outils de gauche (les contrôles de scène) — cliquez dessus pour ouvrir l'interface.

## Troubleshooting

**Le module n'apparaît pas dans "Gérer les modules"?**
- Le dossier est dans `Data/modules/` et contient `module.json` à sa racine ?
- Le monde utilise bien le système `demonlord` ? (l'ID compte, pas le nom affiché)
- La version du système installée respecte-t-elle le minimum demandé par le module ?

**Le module apparaît mais l'icône SODL n'apparaît pas dans la barre de gauche?**
- Actualisez (F5), au besoin avec Ctrl+Shift+R pour vider le cache des scripts
- Vérifiez que le module est bien activé et sauvegardé pour ce monde
- Ouvrez la console (F12) pour repérer une erreur JavaScript au chargement

**Le MJ ne peut pas modifier la réserve de Fortune?**
- Êtes-vous connecté avec un compte ayant le rôle **Gamemaster** (pas juste des permissions élevées) ?
- Vérifiez la console (F12) pour les erreurs

## Mise à jour

1. Supprimez `Data/modules/sodl-companion/`
2. Copiez la nouvelle version
3. Relancez Foundry (ou Ctrl+Shift+R dans le monde pour forcer le rechargement des scripts)

## Désinstaller

1. **World Settings** → **Modules**
2. Décochez SODL Companion
3. **Save Module Settings**
4. Supprimez le dossier `sodl-companion`
5. Relancez
