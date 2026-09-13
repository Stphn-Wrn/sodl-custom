# Installation

## Avant de commencer

Vous avez besoin de:
- Foundry VTT (v11 minimum)
- Accès MJ pour activer le module

## Installation

### 1. Copier les fichiers

Localisez votre dossier `Data`:
- **Windows**: `C:\Users\[VotreNom]\AppData\Local\FoundryVTT\Data`
- **macOS**: `~/Library/Application Support/FoundryVTT/Data`
- **Linux**: `~/.foundryvtt/Data`

Créez un dossier `sodl-companion` dans `Data/modules/` et copiez tous les fichiers du module dedans.

### 2. Activer dans Foundry

1. Ouvrez Foundry VTT
2. Allez dans **World Settings** → **Modules**
3. Trouvez **"L'Ombre du Seigneur Démon - Companion"**
4. Cochez la case pour l'activer
5. Cliquez sur **Save Module Settings**

### 3. Relancer

Fermez et rouvrez votre monde. Le bouton SODL devrait apparaître en bas à droite.

## Troubleshooting

**Le module n'apparaît pas?**
- Le dossier est dans `Data/modules/`?
- Le fichier `module.json` existe?
- Relancez Foundry complètement

**Le bouton n'apparaît pas?**
- Actualisez (F5)
- Vérifiez que le module est activé
- Relancez le monde

**Les modifs ne s'enregistrent pas?**
- Êtes-vous MJ?
- Avez-vous sélectionné un personnage?
- Vérifiez la console (F12)

## Mise à jour

1. Supprimez `Data/modules/sodl-companion/`
2. Copiez la nouvelle version
3. Relancez

## Désinstaller

1. **World Settings** → **Modules**
2. Décochez SODL Companion
3. **Save Module Settings**
4. Supprimez le dossier `sodl-companion`
5. Relancez
