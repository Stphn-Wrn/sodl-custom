# L'Ombre du Seigneur Démon - Module Compagnon

🇬🇧 [English version](README.md)

Module Foundry VTT d'aide de jeu pour **L'Ombre du Seigneur Démon** : HUD de combat, réserve de Fortune du groupe, aide de jeu, tableau de bord du MJ, rappels de round, horloge à dés et diffusion de vidéos YouTube.

**Compatibilité :** Foundry VTT v11+ (testé sur v14 stable 7) | Système `demonlord` v6.1.0+

**Langues :** français et anglais, selon la langue choisie dans Foundry (*Paramètres → Configurer les paramètres → Paramètres principaux → Langue*).

## Ce qu'il y a dedans

### HUD de combat
- **À la place des macros et des joueurs** — Le HUD occupe le bas de l'écran pour le token contrôlé (ou le personnage du joueur). Un bouton, ou un raccourci à définir dans les contrôles, bascule entre le HUD et l'interface d'origine.
- **À gauche** — Portrait (cliquer pour le recadrer), Santé (-1/+1), Folie et Corruption (-1/+1, cliquer sur la Corruption pour son jet), Défense, Vitesse, Pouvoir, taux de guérison (cliquer pour Récupérer), tour rapide/lent et afflictions actives.
- **Couleur de l'état de santé** — Indemne (vert), Touché (jaune), Blessé à partir de la moitié de la Santé (orange), Neutralisé (rouge, portrait grisé).
- **Onglets** — Attaques, Équipement (armes, protections, munitions), Sorts (par tradition), Talents, Objets, Caractéristiques et Professions, Actions, Fortune, Afflictions, Effets.
- **Panneau de jet** — Une attaque, un défi ou un sort d'attaque ouvre un petit panneau au-dessus du HUD : faveurs/fléaux et modificateur, puis Lancer ou Annuler. Le jet passe par le système `demonlord` (afflictions, munitions, utilisations).
- **Équipement strict** — Deux mains et une armure : équiper une arme à deux mains, un bouclier ou une autre armure range ce qui entre en conflit. Les prérequis non remplis sont signalés.
- **Sorts et talents** — Incantations et utilisations restantes affichées ; -/+ au survol pour en rendre ou en retirer.
- **Fortune** — Les utilisations de la Fortune : un clic annonce la dépense et sa règle dans le chat. Le MJ y voit la réserve du groupe et l'ajuste ; les joueurs ne voient pas le total.
- **Actions et afflictions** — Un clic sur une action, ou l'info-bulle (i) d'une affliction, envoie sa règle dans le chat.
- **Effets** — Effets temporaires (bénédictions, sorts actifs...) : activer/désactiver, supprimer, créer.
- **Outils** — Fiche du personnage, lanceur de dés (d2 à d100, 1 à 8 dés), repos 8 h / 24 h.
- **Réglage personnel** — Chaque joueur et le MJ l'activent ou non pour eux-mêmes, sans recharger. La hauteur, le mode et l'onglet ouvert sont mémorisés.

### Tableau de bord du groupe (MJ)
- Tous les personnages joueurs d'un coup d'œil : Santé colorée (-1/+1), Défense, Vitesse, Folie, Corruption, tour rapide/lent, afflictions et réserve de Fortune.
- Clic sur le nom : fiche du personnage ; viseur : sélectionne et centre son token.

### Rappels de round (MJ)
- À chaque nouveau round, le MJ reçoit un message privé : jets de destinée à faire, afflictions actives et effets qui expirent. Désactivable dans les paramètres.

### Compagnon SODL
- **Réserve de Fortune partagée** — Une seule réserve pour tout le groupe. Seul le MJ voit le total et le modifie.
- **Aide de jeu** — Afflictions, actions, options de mêlée/tir, règles situationnelles, hors de combat, folie, corruption, incantation (avec le tableau des utilisations par Puissance/Rang), effets étendus de la Fortune.
- **Recherche instantanée** — Filtre tout le contenu par mot-clé.

### Horloge à Dés
- **Compte à rebours à base de dés**, piloté par le MJ : une heure pleine fait sonner un carillon et poste un message dans le chat.
- **Configurable** — Nombre de dés, faces, minutes par point, heure de départ, son et message final.

### Lecteur YouTube
- **Diffusion synchronisée** — Le MJ lance une vidéo et tout le monde la regarde en même temps (pause, reprise et sauts compris).
- **Recherche et bibliothèque** — Recherche YouTube ou liens collés, bibliothèque en dossiers avec glisser-déposer.
- **Widget flottant** — Déplaçable, redimensionnable, réductible en pastille. Désactivé par défaut.

## Installation

Dans Foundry : *Modules complémentaires → Installer un module*, puis collez l'URL du manifeste :

```
https://raw.githubusercontent.com/Stphn-Wrn/sodl-custom/main/module.json
```

Activez ensuite le module dans le monde. Il n'apparaît dans la liste que si le monde utilise le système `demonlord`. Voir `INSTALLATION.md` pour l'installation manuelle.

## Utilisation

- **HUD de combat** — Sélectionnez un token : le HUD s'affiche en bas de l'écran. Le bouton grille le masque au profit des macros ; le bouton épée le réaffiche.
- **Compagnon** — Icône **livre** dans la barre d'outils de gauche.
- **Horloge à Dés** — Icône **dé** dans la barre d'outils de gauche.
- **Tableau de bord** — Icône **groupe** dans la barre d'outils de gauche (MJ uniquement).
- **Lecteur YouTube** — À activer dans les paramètres du module, puis rafraîchir. L'icône **dossier** du widget affiche la recherche et la bibliothèque ; cliquer sur une vidéo la lance chez tout le monde.

La recherche YouTube fonctionne sans configuration grâce à des instances publiques [Invidious](https://invidious.io), parfois indisponibles. Pour une recherche fiable, renseignez une clé **YouTube Data API v3** dans les paramètres. Cette clé est visible des joueurs connectés : restreignez-la à l'API YouTube Data dans la console Google.

## Personnalisation

- **Textes et règles** — Tous les textes, y compris l'aide de jeu, sont dans `lang/fr.json` et `lang/en.json` (section `SODL.Rules` pour les règles). `src/features/companion/config.js` ne contient que la structure et les clés.
- **Réserve de Fortune max par défaut** — `resources.chancePoints.maximum` dans `config.js` ; le MJ l'ajuste ensuite depuis le compagnon.
- **Styles** — Chaque outil a sa feuille de style dans son dossier.

Voir `CUSTOMIZATION.md` pour plus de détails.

## Structure

```
sodl-companion/
├── module.json
├── lang/                     # Textes français et anglais
├── src/
│   ├── main.js               # Point d'entrée : init / ready / boutons de chaque outil
│   ├── shared/               # Constantes, compatibilité Foundry, traduction
│   └── features/
│       ├── combat-hud/       # HUD de combat
│       ├── party-dashboard/  # Tableau de bord du groupe (MJ)
│       ├── round-reminders/  # Rappels de round (MJ)
│       ├── companion/        # Aide de jeu, recherche et réserve de Fortune
│       ├── dice-clock/       # Horloge à Dés
│       └── youtube-player/   # Lecteur YouTube synchronisé
├── tests/                    # Tests de la logique pure (npm test)
└── sounds/                   # Carillon de l'horloge
```

## Accéder aux données

Les classes principales sont exposées sur `window` pour les macros et la console.

```javascript
// Réserve de Fortune (setting monde partagé ; modifications réservées au MJ)
SODLDataManager.getChancePoints();
await SODLDataManager.modifyChancePoints(+1);

// Horloge à Dés
SODLDiceClockManager.getState();            // { remaining, hour }
await SODLDiceClockManager.removePoints(1);

// Lecteur YouTube
await SODLYoutubeBroadcast.start(SODLYoutubeManager.getLibrary().videos[0]);
await SODLYoutubeSearch.query("musique taverne");

// HUD de combat et tableau de bord
SODLCombatHud.toggleMode();
new SODLPartyDashboard().render(true);
```

## Développement

La logique sans dépendance à Foundry est couverte par des tests Node (v22+), sans dépendance à installer :

```bash
npm test
```

Les tests tournent sur GitHub à chaque push, et la release ne part pas s'ils échouent. Les fichiers `tests/` et `package.json` sont exclus de l'archive de release.

## Problèmes ?

**Le module n'apparaît pas dans la liste des modules du monde**
- Vérifiez que le monde utilise bien le système `demonlord`, dans une version au moins égale au minimum déclaré dans `module.json`.

**Une icône n'apparaît pas dans la barre de gauche**
- Actualisez (F5) et vérifiez que le module, ou l'outil concerné, est activé.
- Ouvrez la console (F12) : une erreur au chargement empêche l'ajout des boutons.

**Le HUD de combat n'apparaît pas**
- Sélectionnez un token de personnage (ou, côté joueur, ayez un personnage assigné).
- Vérifiez qu'il est activé dans vos paramètres du module, et qu'il n'est pas basculé sur les macros.

**Le widget YouTube n'apparaît pas**
- Il est désactivé par défaut. Côté joueur, il n'apparaît que pendant une diffusion.

**La vidéo ne démarre pas chez un joueur**
- Si le navigateur bloque la lecture automatique, un bouton **« Rejoindre la diffusion »** apparaît.
- Certaines vidéos refusent d'être intégrées hors de YouTube : il faut en choisir une autre.

**La recherche YouTube ne renvoie rien**
- Renseignez une clé YouTube Data API v3, ou changez les instances Invidious dans les paramètres. Coller un lien fonctionne toujours.

## Licence

Code sous licence MIT. *L'Ombre du Seigneur Démon* / *Shadow of the Demon Lord* est une marque de Schwalb Entertainment ; ce module est un projet de fan non officiel. Les règles résumées restent la propriété de leurs auteurs.
