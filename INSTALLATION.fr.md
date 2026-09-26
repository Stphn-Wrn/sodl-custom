# Installation

🇬🇧 [English version](INSTALLATION.md)

## Avant de commencer

Il vous faut :
- Foundry VTT (v11 minimum, testé sur v14 stable 7) ;
- le système de jeu `demonlord` (« Shadow of the Demon Lord ») installé ;
- un accès MJ pour activer le module.

## Installer

### Option A — Par URL de manifeste (recommandé)

1. Dans l'écran d'accueil de Foundry, onglet **Modules complémentaires**, cliquez sur **Installer un module**.
2. Collez cette URL dans le champ **URL du manifeste**, en bas de la fenêtre :
   ```
   https://raw.githubusercontent.com/Stphn-Wrn/sodl-custom/main/module.json
   ```
3. Cliquez sur **Installer**.

Avec cette méthode, Foundry propose automatiquement les mises à jour.

### Option B — Installation manuelle

Repérez votre dossier `Data` :
- **Windows** : `C:\Users\[VotreNom]\AppData\Local\FoundryVTT\Data`
- **macOS** : `~/Library/Application Support/FoundryVTT/Data`
- **Linux** : `~/.foundryvtt/Data`

Créez un dossier `sodl-companion` dans `Data/modules/` et copiez-y tous les fichiers du module (`module.json` doit être à la racine de ce dossier).

## Activer dans le monde

1. Lancez un monde qui utilise le système `demonlord`.
2. **Paramètres du jeu → Gérer les modules**.
3. Cochez **« L'Ombre du Seigneur Démon - Companion »**, puis enregistrez.

> Le module n'apparaît dans cette liste que si le monde utilise le système `demonlord` dans une version compatible (voir `module.json` → `relationships.systems`).

Une fois le monde rechargé :
- le **HUD de combat** s'affiche en bas de l'écran dès qu'un token est sélectionné ;
- la barre d'outils de gauche contient l'icône **livre** (Compagnon), l'icône **dé** (Horloge à Dés) et, pour le MJ, l'icône **groupe** (tableau de bord).

## Paramètres

Dans **Paramètres du jeu → Configurer les paramètres → L'Ombre du Seigneur Démon - Companion** :

| Paramètre | Par défaut | Qui |
|---|---|---|
| HUD de combat : activer | activé | chaque joueur |
| Horloge à Dés : activer, dés, faces, minutes par point, heure de départ, son, message final | activée | MJ |
| Lecteur YouTube : activer, clé API, instances Invidious | désactivé | MJ |
| Rappels de round : activer | activé | MJ |
| Masquer les outils MJ du système (Player Tracker) | activé | MJ |

Le raccourci pour basculer entre le HUD et les macros se définit dans **Configurer les contrôles**.

La langue du module suit celle de Foundry (**Paramètres principaux → Langue**) : français ou anglais.

## Mettre à jour

**Installé par URL de manifeste** — Onglet **Modules complémentaires**, bouton **Mettre à jour** à côté du module.

**Installé manuellement** — Supprimez `Data/modules/sodl-companion/`, copiez la nouvelle version, puis rechargez le monde (Ctrl+Maj+R pour vider le cache des scripts).

Les données sont conservées lors d'une mise à jour :
- **dans le monde** : réserve de Fortune, état de l'horloge, bibliothèque YouTube, paramètres du MJ ;
- **sur chaque compte** : disposition du HUD et favoris ;
- **sur les personnages** : cadrage du portrait.

## Désinstaller

1. **Gérer les modules** : décochez le module et enregistrez.
2. Supprimez le dossier `sodl-companion`.

## Problèmes

**Le module n'apparaît pas dans « Gérer les modules »**
- Le dossier est bien dans `Data/modules/` et contient `module.json` à sa racine ?
- Le monde utilise bien le système `demonlord` (l'ID compte, pas le nom affiché), dans une version suffisante ?

**Une icône manque dans la barre de gauche**
- Actualisez (F5, au besoin Ctrl+Maj+R).
- Vérifiez que le module, ou l'outil concerné, est activé.
- Ouvrez la console (F12) pour repérer une erreur au chargement.

**Le HUD de combat n'apparaît pas**
- Sélectionnez un token de personnage (côté joueur, un personnage assigné suffit).
- Vérifiez qu'il est activé dans vos paramètres et qu'il n'est pas basculé sur les macros (bouton épée pour le réafficher).

**Le widget YouTube n'apparaît pas**
- Activez-le dans les paramètres puis rafraîchissez. Côté joueur, il n'apparaît que pendant une diffusion.
- Le lecteur charge l'API depuis `youtube.com` : il ne fonctionne pas hors ligne ou si YouTube est bloqué.

**Le MJ ne peut pas modifier la réserve de Fortune**
- Le compte doit avoir le rôle **Gamemaster** (pas seulement des permissions élevées).
