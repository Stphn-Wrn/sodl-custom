# L'Ombre du Seigneur Démon - Module Compagnon

Module Foundry VTT d'aide de jeu pour **L'Ombre du Seigneur Démon** : réserve de Fortune du groupe, résumé des règles, horloge à dés et diffusion de vidéos YouTube.

**Compatibilité:** Foundry VTT v11+ (testé sur v14 stable 7) | Système `demonlord` v6.1.0+

## Ce qu'il y a dedans

Le module regroupe quatre outils indépendants :

### Compagnon SODL
- **Réserve de Fortune partagée** — Une seule réserve pour tout le groupe (pas par personnage). Seul le MJ voit le total et peut le modifier ; les joueurs voient un message masqué.
- **Recherche instantanée** — Une barre de recherche en haut de la fenêtre filtre en direct afflictions, actions, options de mêlée/tir, autres attaques et règles diverses.
- **Aide de jeu complète** — Afflictions, actions, règles de mêlée/tir, règles situationnelles, hors de combat, folie, corruption, incantation de sorts (avec le tableau des utilisations par Puissance/Niveau).
- **Effets de la Fortune** — Effets de base et effets étendus (imposer des fléaux, refuser une Marque des ténèbres, retenir la main de la Mort, etc.), plus une table de fréquence des récompenses visible seulement du MJ.
- **4 onglets** — Ressources, Règles, Actions, Aide.

### Horloge à Dés
- **Compte à rebours à base de dés** — Chaque point retiré fait avancer le temps ; une heure pleine fait sonner un carillon et poste un message dans le chat.
- **Piloté par le MJ** — Les joueurs voient l'horloge en lecture seule.
- **Configurable** — Nombre de dés, faces, minutes par point, heure de départ, son et message final réglables dans les paramètres : réutilisable pour n'importe quelle scène chronométrée.

### Lecteur YouTube
- **Diffusion synchronisée** — Le MJ lance une vidéo et tout le monde la regarde en même temps. Pause, reprise et sauts dans la vidéo sont répercutés chez tous les joueurs.
- **Recherche intégrée** — Le MJ cherche sur YouTube (ou colle un lien) directement dans le widget, puis diffuse ou ajoute la vidéo en un clic.
- **Bibliothèque en dossiers** — Le MJ range ses vidéos (ambiances, cinématiques, musiques...) dans des dossiers, sans aucune fenêtre de dialogue : création et renommage sur place, glisser-déposer entre dossiers.
- **Lecteur intégré** — L'interface YouTube est masquée au profit des contrôles du widget (lecture/pause, progression, volume, plein écran).
- **Widget flottant discret** — Déplaçable, redimensionnable, réductible en pastille sans couper la vidéo. Chez les joueurs, il n'apparaît que pendant une diffusion.
- **Désactivé par défaut** — À activer dans les paramètres du module.

### HUD de combat
- **À la place des macros et des joueurs** — Le HUD occupe le bas de l'écran, de la liste des joueurs jusqu'à la barre latérale, pour le token contrôlé (ou le personnage du joueur). Un bouton (ou un raccourci à définir dans les contrôles) bascule entre le HUD et l'interface d'origine.
- **À gauche** — Portrait (cliquer pour le recadrer : glisser pour déplacer, molette pour zoomer ; cadrage enregistré sur le personnage), Santé (boutons -1/+1 dégât), Folie et Corruption (boutons -1/+1, cliquer sur la Corruption pour son jet), Défense, Vitesse, Pouvoir, taux de guérison (cliquer pour Récupérer) et afflictions actives.
- **À droite** — Onglets Attaques (armes portées, munitions), Équipement (armes, protections et munitions, une ligne chacune), Sorts (par tradition, puis incantations restantes, −/+ au survol pour en rendre ou en retirer), Talents (idem pour leurs utilisations), Objets (consommables), Caractéristiques et Professions, Afflictions, plus l'accès à la fiche du personnage (bouton ou clic sur le nom), un lanceur de dés (d2 à d100, de 1 à 8 dés) et le repos (8 h, 24 h).
- **Couleur de l'état de santé** — Barre de Santé, cadre du portrait et mention sous le nom : Indemne (vert), Touché (jaune), Blessé à partir de la moitié de la Santé (orange), Neutralisé (rouge, portrait grisé).
- **Onglet Afflictions** — Les afflictions actives (celles du système `demonlord`) ; un clic en retire une, « Ajouter une affliction » ouvre la liste des autres.
- **Onglet Effets** — Les effets temporaires hors afflictions (bénédictions, sorts actifs...) : clic pour activer/désactiver, ✕ pour supprimer, clic droit pour la fiche de l'effet, « Nouvel effet » pour en créer un. L'info-bulle (i) d'une affliction, comme son icône dans la colonne de gauche, envoie sa règle dans le chat.
- **Équipement strict** — Deux mains et une armure : équiper une arme à deux mains, un bouclier ou une autre armure range automatiquement ce qui entre en conflit. Les prérequis de caractéristique non remplis sont signalés.
- **Tout dans le HUD** — Une attaque, un défi ou un sort d'attaque ouvre un petit panneau de jet au-dessus du HUD : faveurs/fléaux et modificateur (0 par défaut), puis Lancer ou Annuler. Le jet passe par le système `demonlord` (afflictions, munitions, utilisations), dont la fenêtre est remplie et validée automatiquement. Une profession propose de choisir la caractéristique concernée. Clic droit : ouvre la fiche de l'objet.
- **Hauteur réglable** — Poignée sur le bord supérieur, mémorisée par joueur, comme le mode affiché et l'onglet ouvert.
- **Réglage personnel** — Activé par défaut ; chaque joueur et le MJ peuvent le désactiver pour eux-mêmes dans les paramètres du module, sans recharger (lié au compte en v12+, au navigateur en v11).

## Installation

1. Créez un dossier `sodl-companion` dans `Data/modules/`
2. Copiez tous les fichiers du module dedans
3. Activez le module dans les paramètres du monde (il ne s'affiche dans la liste que si le monde tourne sur le système `demonlord`, cf. `module.json`)
4. Relancez votre monde

Voir `INSTALLATION.md` pour le détail, dont l'installation par URL de manifeste.

## Utilisation

### Compagnon SODL

Cliquez sur l'icône **livre (SODL)** dans la barre d'outils de gauche (les contrôles de scène) pour ouvrir l'interface.

**Ressources** — Réserve de Fortune du groupe. Le MJ voit le total, peut faire +1/-1/Réinitialiser et éditer le maximum. Les joueurs voient uniquement un message indiquant que le MJ garde le compte.

**Règles** — Afflictions, règles situationnelles, hors de combat, folie, corruption.

**Actions** — Actions de base, options de mêlée/tir, autres types d'attaques, lancer un sort (avec le tableau des utilisations) et utiliser une incantation.

**Aide** — Infos sur le module et les permissions.

**Recherche** — Tapez dans la barre en haut pour filtrer instantanément tout le contenu ci-dessus par mot-clé, sans changer d'onglet.

### Horloge à Dés

Cliquez sur l'icône **dé** dans la barre d'outils de gauche. Activée par défaut ; désactivable dans les paramètres du module.

Commandes du MJ :
- **Pièce / Étage** — retire 1 point
- **Repos court** — retire 1 heure de points
- **Ajustement +/-** — corrige d'un point dans un sens ou dans l'autre
- **Réinitialiser** — remet l'horloge à son état de départ (avec confirmation)

À chaque heure pleine, le carillon sonne et un message est posté dans le chat. Quand tous les points sont épuisés, le message final configuré est envoyé.

### Lecteur YouTube

1. **Activez-le** : *Paramètres → Configurer les paramètres → L'Ombre du Seigneur Démon - Companion → « Lecteur YouTube : activer le module »*, puis rafraîchissez la partie.
2. Le widget apparaît chez le MJ. L'icône **dossier** du widget affiche ou masque la recherche et la bibliothèque :
   - **Recherche** — tapez des mots-clés, ou collez un lien (`youtube.com/watch?v=…`, `youtu.be/…`, `/shorts/…`, `/embed/…`, `/live/…`). Pour chaque résultat : **▶** le diffuse tout de suite, **+** l'ajoute à la bibliothèque dans le dossier choisi en haut des résultats.
   - **Plusieurs liens d'un coup** — collez une liste de liens (un par ligne, ou séparés par des espaces ou des virgules ; les doublons et lignes sans lien sont ignorés) : chaque vidéo apparaît dans les résultats, et le bouton **« Tout ajouter »** (icône de pile) les range toutes dans le dossier choisi en une fois.
   - **Nouveau dossier** — icône à droite de « Bibliothèque » : le nom se saisit sur place (Entrée pour valider, Échap pour annuler).
   - Au survol d'un dossier ou d'une vidéo : **crayon** pour renommer sur place, **corbeille** puis second clic pour supprimer. Supprimer un dossier déplace ses vidéos dans « Non classé ».
   - **Glissez une vidéo** sur un dossier pour l'y ranger.
3. **Cliquez sur une vidéo** : elle démarre chez tout le monde. Le MJ la pilote avec les contrôles du widget (lecture/pause — ou clic sur l'image —, barre de progression).
4. **■ (arrêter)** ferme la vidéo pour tous.

La recherche fonctionne sans configuration grâce à des instances publiques [Invidious](https://invidious.io), parfois indisponibles. Pour une recherche fiable, renseignez une clé **YouTube Data API v3** (gratuite, créée depuis la Google Cloud Console) dans le paramètre **« Lecteur YouTube : clé API (recherche) »**. Cette clé est visible des joueurs connectés au monde : restreignez-la à l'API YouTube Data dans la console Google.

Côté joueurs, le widget apparaît automatiquement pendant une diffusion. Ils ne peuvent pas agir sur la lecture, seulement régler leur propre volume. Un joueur qui se connecte en cours de route arrive directement au bon moment de la vidéo.

Chacun peut déplacer le widget (par son en-tête), l'élargir (coin inférieur droit) et le réduire en pastille (`–`) : la vidéo continue de jouer. La position, la largeur et l'état réduit sont mémorisés par utilisateur.

## Personnalisation

### Points de chance max par défaut
`src/features/companion/config.js`:
```javascript
resources: {
  chancePoints: {
    maximum: 6
  }
}
```
C'est la valeur par défaut du setting monde `maxChancePoints` ; le MJ peut ensuite l'ajuster directement depuis l'onglet Ressources.

### Contenu des onglets
Toutes les données (afflictions, actions, règles, sorts, effets de Fortune) sont dans `src/features/companion/config.js`. `src/features/companion/companion-app.js` (`getRulesData()`, `getActionsData()`, `getResourcesData()`) construit l'affichage à partir de ces données.

### Couleurs
Chaque outil a sa feuille de style dans son dossier (`companion.css`, `dice-clock.css`, `youtube-player.css`). Palette sombre commune inspirée des fiches "Path" du système :
- Accent: `#A13030` (compagnon), `#c9544f` (widget YouTube)
- Fond: `#1b1b1b` / `#171717` / `#202020`
- Texte: `#d8d8d8`

Voir `CUSTOMIZATION.md` pour le reste (horloge, lecteur YouTube, ajout d'un outil).

## Structure

```
sodl-companion/
├── module.json
├── src/
│   ├── main.js                    # Point d'entrée : lance init/ready/boutons de chaque outil
│   ├── shared/
│   │   ├── constants.js           # MODULE_ID, chemins du module
│   │   └── foundry-adapter.js     # Compatibilité entre versions de Foundry (Dialog, templates, audio...)
│   └── features/
│       ├── companion/             # Fenêtre de règles, recherche et réserve de Fortune
│       │   ├── register.js        # Settings + bouton scene-controls
│       │   ├── config.js          # Toutes les données de règles (afflictions, actions, sorts, Fortune...)
│       │   ├── data-manager.js    # Lecture/écriture de la réserve de Fortune (game.settings)
│       │   ├── companion-app.js   # FormApplication + logique de recherche
│       │   ├── companion.html
│       │   └── companion.css
│       ├── dice-clock/            # Horloge à Dés
│       │   ├── register.js        # Settings + bouton scene-controls
│       │   ├── dice-clock-manager.js # État, calcul des dés, carillon et messages
│       │   ├── dice-clock-app.js  # Fenêtre de l'horloge
│       │   ├── dice-clock.html
│       │   └── dice-clock.css
│       └── youtube-player/        # Widget de diffusion YouTube
│           ├── register.js        # Settings + montage du widget
│           ├── widget.js          # Widget flottant, contrôles et synchronisation du lecteur
│           ├── library-panel.js   # Recherche + bibliothèque du MJ (édition sur place)
│           ├── search-service.js  # Recherche YouTube (paramètres, oEmbed)
│           ├── library-manager.js # Persistance de la bibliothèque
│           ├── broadcast-manager.js # Persistance de l'état de diffusion
│           ├── library.js         # Logique pure : dossiers et vidéos
│           ├── broadcast.js       # Logique pure : synchronisation
│           ├── url-parser.js      # Logique pure : liens YouTube → ID
│           ├── search.js          # Logique pure : fournisseurs de recherche (API YouTube, Invidious)
│           ├── time-format.js     # Logique pure : affichage des durées
│           ├── iframe-api.js      # Chargement de l'API YouTube
│           ├── widget.html, library.html, search-results.html
│           └── youtube-player.css
├── tests/                         # Tests de la logique pure (npm test)
├── sounds/                        # Carillon de l'horloge
└── lang/
    ├── fr.json
    └── en.json
```

## Accéder aux données

Les classes principales sont exposées sur `window` pour les macros et la console.

### Réserve de Fortune
Setting **monde** partagé (pas un flag d'acteur) :

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

### Horloge à Dés
```javascript
SODLDiceClockManager.getState();            // { remaining, hour }
await SODLDiceClockManager.removePoints(1); // MJ seulement
await SODLDiceClockManager.resetClock();    // MJ seulement
```

### Lecteur YouTube
```javascript
// Bibliothèque (modifications réservées au MJ)
SODLYoutubeManager.getLibrary();            // { folders: [...], videos: [...] }
await SODLYoutubeManager.addFolder("Ambiances");
await SODLYoutubeManager.addVideo({ url: "https://youtu.be/…", title: "", folderId: null });

// Diffusion (MJ seulement)
const video = SODLYoutubeManager.getLibrary().videos[0];
await SODLYoutubeBroadcast.start(video);
await SODLYoutubeBroadcast.stop();
SODLYoutubeBroadcast.getState();            // { video, playing, position, updatedAt }

// Recherche
await SODLYoutubeSearch.query("musique taverne"); // [{ videoId, title, channel, duration, thumbnail }]
```

## Développement

La logique sans dépendance à Foundry (liens YouTube, recherche, bibliothèque, synchronisation) est couverte par des tests Node (v22+), sans aucune dépendance à installer :

```bash
npm test
```

Les fichiers `tests/` et `package.json` sont exclus de l'archive de release.

## Problèmes?

**Le module n'apparaît pas dans "Gérer les modules" du monde**
- Vérifiez que le monde tourne bien sur le système `demonlord` (l'ID exact déclaré dans `module.json` → `relationships.systems`), pas juste un système au nom similaire.
- Vérifiez que la version du système installée respecte le minimum déclaré dans `module.json`.

**L'icône SODL ou l'icône de l'horloge n'apparaît pas dans la barre de gauche**
- Actualisez (F5)
- Vérifiez que le module est activé dans le monde (et, pour l'horloge, qu'elle n'est pas désactivée dans les paramètres du module)
- Ouvrez la console (F12) : une erreur au chargement de `src/main.js` (ou d'un des `register.js`) empêche le hook `getSceneControlButtons` de s'exécuter.

**Le widget YouTube n'apparaît pas**
- Il est désactivé par défaut : activez-le dans les paramètres du module puis rafraîchissez la partie.
- Côté joueur, c'est normal hors diffusion : il n'apparaît que quand le MJ lance une vidéo.

**La vidéo ne démarre pas chez un joueur**
- Le navigateur bloque parfois la lecture automatique, surtout juste après la connexion : un bouton **« Rejoindre la diffusion »** apparaît alors sur la vidéo, il suffit de cliquer dessus.
- Certaines vidéos refusent d'être intégrées hors de YouTube (choix de leur auteur) : le lecteur affiche alors une erreur. Il faut en choisir une autre.

**La recherche YouTube ne renvoie rien ou affiche une erreur**
- Sans clé API, la recherche dépend d'instances Invidious publiques qui tombent régulièrement : renseignez une clé YouTube Data API v3, ou remplacez les instances dans le paramètre **« Lecteur YouTube : instances Invidious »**.
- Coller directement un lien YouTube fonctionne toujours, même sans service de recherche.

**La pause ou les sauts du MJ ne sont pas répercutés**
- Le widget du MJ doit rester chargé (il peut être réduit). Si le MJ rafraîchit sa page, la vidéo continue chez les joueurs et le MJ reprend la main dès que son widget est rechargé.
- Un seul MJ doit piloter : deux MJ connectés en même temps peuvent se contredire.

**Le MJ ne voit pas ses changements enregistrés**
- Êtes-vous bien connecté en tant que MJ (pas juste un joueur avec des permissions élevées) ?
- Vérifiez la console (F12) pour les erreurs.

Voir `INSTALLATION.md` et `CUSTOMIZATION.md` pour plus de détails.

## Licence

MIT
